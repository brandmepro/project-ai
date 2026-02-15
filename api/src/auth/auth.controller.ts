import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser('id') userId: number) {
    await this.authService.logout(userId);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User details returned' })
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      businessType: user.businessType,
      createdAt: user.createdAt,
    };
  }

  @Public()
  @Post('password/send-otp')
  @ApiOperation({ 
    summary: 'Send OTP for password change',
    description: 'Sends a 6-digit OTP to the user\'s email for password verification. For development, use OTP: 123456',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendPasswordChangeOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendPasswordChangeOtp(sendOtpDto.email);
  }

  @Public()
  @Post('password/verify-otp')
  @ApiOperation({ 
    summary: 'Verify OTP and get token',
    description: 'Verifies the OTP and returns a temporary token for password change. Development OTP: 123456',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Public()
  @Post('password/change')
  @ApiOperation({ 
    summary: 'Change password with OTP token',
    description: 'Changes the user password using the OTP verification token',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePasswordWithOtp(
      changePasswordDto.otpToken,
      changePasswordDto.newPassword,
    );
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google consent screen' })
  async googleAuth(@Req() req: Request) {
    // This route initiates the Google OAuth flow
    // The GoogleAuthGuard handles the redirect to Google's consent screen
    // This method won't actually execute as the guard redirects first
    // but we need it for proper route registration
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // User profile is attached by GoogleStrategy
    const googleUser = req.user as any;

    // Validate or create user
    const user = await this.authService.validateOAuthUser(
      googleUser.email,
      googleUser.googleId,
      googleUser.name,
      googleUser.picture,
    );

    // Generate JWT tokens
    const tokens = await this.authService.googleLogin(user);

    // Get frontend URL from config
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    // Redirect to frontend with tokens
    const redirectUrl = `${frontendUrl}/oauth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&onboardingCompleted=${user.onboardingCompleted}`;
    
    return res.redirect(redirectUrl);
  }
}
