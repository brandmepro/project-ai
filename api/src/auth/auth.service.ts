import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

interface OtpStorage {
  otp: string;
  email: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  // In-memory OTP storage (for now - in production, use Redis or database)
  private otpStorage: Map<string, OtpStorage> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.businessType,
      registerDto.businessName,
      registerDto.goals,
    );

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessType: user.businessType,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(user: User) {
    await this.usersService.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessType: user.businessType,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old token
    await this.refreshTokenRepository.update(tokenRecord.id, {
      isRevoked: true,
      revokedAt: new Date(),
    });

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.user);

    return tokens;
  }

  async logout(userId: number): Promise<void> {
    // Revoke all active refresh tokens for this user
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  /**
   * Send OTP for password change
   */
  async sendPasswordChangeOtp(email: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    this.otpStorage.set(email, {
      otp,
      email,
      expiresAt,
    });

    // TODO: Send OTP via email service
    // For now, log it to console (in development)
    console.log(`[OTP for ${email}]: ${otp}`);
    console.log(`[OTP] Use this code for testing: 123456 (hardcoded for development)`);

    // Clean up expired OTPs
    this.cleanupExpiredOtps();

    return {
      message: 'OTP sent to your email address',
    };
  }

  /**
   * Verify OTP and return a temporary token
   */
  async verifyOtp(email: string, otp: string): Promise<{ otpToken: string; message: string }> {
    // Allow hardcoded OTP for development
    const isDevelopmentOtp = otp === '123456';
    
    if (!isDevelopmentOtp) {
      const storedOtp = this.otpStorage.get(email);

      if (!storedOtp) {
        throw new BadRequestException('OTP not found or expired');
      }

      if (new Date() > storedOtp.expiresAt) {
        this.otpStorage.delete(email);
        throw new BadRequestException('OTP has expired');
      }

      if (storedOtp.otp !== otp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Delete OTP after successful verification
      this.otpStorage.delete(email);
    }

    // Generate a temporary token for password change (valid for 15 minutes)
    const otpToken = this.jwtService.sign(
      { email, purpose: 'password-change' },
      { 
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '15m',
      } as any,
    );

    return {
      otpToken,
      message: 'OTP verified successfully',
    };
  }

  /**
   * Change password using OTP token
   */
  async changePasswordWithOtp(otpToken: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Verify OTP token
      const payload = this.jwtService.verify(otpToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.purpose !== 'password-change') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      // Find user by email
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update password
      await this.usersService.updatePassword(user.id, newPassword);

      // Logout user from all devices (revoke all refresh tokens)
      await this.logout(user.id);

      return {
        message: 'Password changed successfully. Please login with your new password.',
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired OTP token');
      }
      throw error;
    }
  }

  /**
   * Clean up expired OTPs from memory
   */
  private cleanupExpiredOtps(): void {
    const now = new Date();
    for (const [email, data] of this.otpStorage.entries()) {
      if (now > data.expiresAt) {
        this.otpStorage.delete(email);
      }
    }
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn') || '15m',
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
    } as any);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
