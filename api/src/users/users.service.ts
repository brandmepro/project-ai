import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BusinessType } from '../common/enums';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    password: string,
    name: string,
    businessType?: BusinessType,
    businessName?: string,
    goals?: string[],
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      passwordHash,
      name,
      businessName: businessName || null,
      businessType,
      contentGoals: goals || [],
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'businessType'>>,
  ): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updates);
    return this.usersRepository.save(user);
  }

  async deleteAccount(userId: string): Promise<void> {
    const result = await this.usersRepository.softDelete(userId);
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateBusinessProfile(
    userId: string,
    updateDto: UpdateBusinessProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.businessName !== undefined) {
      user.businessName = updateDto.businessName;
    }
    if (updateDto.businessType !== undefined) {
      user.businessType = updateDto.businessType;
    }
    if (updateDto.businessDescription !== undefined) {
      user.businessDescription = updateDto.businessDescription;
    }

    return this.usersRepository.save(user);
  }

  async updatePreferences(
    userId: string,
    updateDto: UpdatePreferencesDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.preferences = {
      ...user.preferences,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  async updateNotifications(
    userId: string,
    updateDto: UpdateNotificationsDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await this.validatePassword(user, currentPassword);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }

  async enable2FA(userId: string, secret: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    return this.usersRepository.save(user);
  }

  async disable2FA(userId: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    return this.usersRepository.save(user);
  }

  async getPreferences(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.preferences;
  }

  async getNotificationSettings(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.notificationSettings;
  }
}
