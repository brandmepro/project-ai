import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Settings } from '../settings/entities/settings.entity';
import { NotificationSettings } from '../notifications/entities/notification-settings.entity';
import * as bcrypt from 'bcrypt';
import { BusinessType } from '../common/enums';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';
import { UpdateSchedulingSettingsDto } from './dto/update-scheduling-settings.dto';
import { UpdateAnalyticsSettingsDto } from './dto/update-analytics-settings.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { UpdateAdvancedSettingsDto } from './dto/update-advanced-settings.dto';
import { UpdatePlatformPreferencesDto } from '../platforms/dto/update-platform-preferences.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    @InjectRepository(NotificationSettings)
    private notificationSettingsRepository: Repository<NotificationSettings>,
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

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash,
      name,
      businessName: businessName || null,
      businessType,
      contentGoals: goals || [],
    });

    const savedUser = await this.usersRepository.save(user);

    // Create default settings
    const settings = this.settingsRepository.create({
      userId: savedUser.id,
    });
    await this.settingsRepository.save(settings);

    // Create default notification settings
    const notificationSettings = this.notificationSettingsRepository.create({
      userId: savedUser.id,
    });
    await this.notificationSettingsRepository.save(notificationSettings);

    // Return user with relations
    return this.findById(savedUser.id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['settings', 'notificationSettings'],
    });
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updateProfile(
    userId: number,
    updates: Partial<Pick<User, 'name' | 'businessType'>>,
  ): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updates);
    return this.usersRepository.save(user);
  }

  async deleteAccount(userId: number): Promise<void> {
    const result = await this.usersRepository.softDelete(userId);
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateBusinessProfile(
    userId: number,
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
    userId: number,
    updateDto: UpdatePreferencesDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.settings) {
      throw new NotFoundException('User settings not found');
    }

    // Update settings entity
    Object.assign(user.settings, updateDto);
    await this.settingsRepository.save(user.settings);

    return this.findById(userId);
  }

  async updateNotifications(
    userId: number,
    updateDto: UpdateNotificationsDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.notificationSettings) {
      throw new NotFoundException('User notification settings not found');
    }

    // Update notification settings entity
    Object.assign(user.notificationSettings, updateDto);
    await this.notificationSettingsRepository.save(user.notificationSettings);

    return this.findById(userId);
  }

  async changePassword(
    userId: number,
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

  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }

  async enable2FA(userId: number, secret: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    return this.usersRepository.save(user);
  }

  async disable2FA(userId: number): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    return this.usersRepository.save(user);
  }

  async getPreferences(userId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.settings;
  }

  async getNotificationSettings(userId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.notificationSettings;
  }

  /**
   * Update password without requiring current password (used for OTP-based password reset)
   */
  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  // AI Settings
  async getAiSettings(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings;
  }

  async updateAiSettings(
    userId: number,
    updateDto: UpdateAiSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user || !user.settings) {
      throw new NotFoundException('User or settings not found');
    }

    Object.assign(user.settings, updateDto);
    await this.settingsRepository.save(user.settings);

    return this.findById(userId);
  }

  // Scheduling Settings
  async getSchedulingSettings(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings;
  }

  async updateSchedulingSettings(
    userId: number,
    updateDto: UpdateSchedulingSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user || !user.settings) {
      throw new NotFoundException('User or settings not found');
    }

    Object.assign(user.settings, updateDto);
    await this.settingsRepository.save(user.settings);

    return this.findById(userId);
  }

  // Analytics Settings
  async getAnalyticsSettings(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings;
  }

  async updateAnalyticsSettings(
    userId: number,
    updateDto: UpdateAnalyticsSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user || !user.settings) {
      throw new NotFoundException('User or settings not found');
    }

    Object.assign(user.settings, updateDto);
    await this.settingsRepository.save(user.settings);

    return this.findById(userId);
  }

  // Privacy Settings
  async getPrivacySettings(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings;
  }

  async updatePrivacySettings(
    userId: number,
    updateDto: UpdatePrivacySettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user || !user.settings) {
      throw new NotFoundException('User or settings not found');
    }

    Object.assign(user.settings, updateDto);
    await this.settingsRepository.save(user.settings);

    return this.findById(userId);
  }

  // Advanced Settings
  async getAdvancedSettings(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings;
  }

  async updateAdvancedSettings(
    userId: number,
    updateDto: UpdateAdvancedSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user || !user.settings) {
      throw new NotFoundException('User or settings not found');
    }

    Object.assign(user.settings, updateDto);
    await this.settingsRepository.save(user.settings);

    return this.findById(userId);
  }

  // Reset all settings to defaults
  async resetAllSettings(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user || !user.settings || !user.notificationSettings) {
      throw new NotFoundException('User or settings not found');
    }

    // Reset settings to defaults
    const defaultSettings = this.settingsRepository.create({
      userId: user.id,
    });
    Object.assign(user.settings, defaultSettings);
    await this.settingsRepository.save(user.settings);

    // Reset notification settings to defaults
    const defaultNotifications = this.notificationSettingsRepository.create({
      userId: user.id,
    });
    Object.assign(user.notificationSettings, defaultNotifications);
    await this.notificationSettingsRepository.save(user.notificationSettings);
  }

  // Platform Preferences - Deprecated (will be removed in future versions)
  async getPlatformPreferences(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Return empty object as platform preferences are now handled via Platforms table
    return {};
  }

  async updatePlatformPreferences(
    userId: number,
    updateDto: UpdatePlatformPreferencesDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Platform preferences are now handled via Platforms table, this is a no-op
    return user;
  }
}
