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

  /**
   * Update password without requiring current password (used for OTP-based password reset)
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  // AI Settings
  async getAiSettings(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.aiSettings;
  }

  async updateAiSettings(
    userId: string,
    updateDto: UpdateAiSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.aiSettings = {
      ...user.aiSettings,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  // Scheduling Settings
  async getSchedulingSettings(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.schedulingSettings;
  }

  async updateSchedulingSettings(
    userId: string,
    updateDto: UpdateSchedulingSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.schedulingSettings = {
      ...user.schedulingSettings,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  // Analytics Settings
  async getAnalyticsSettings(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.analyticsSettings;
  }

  async updateAnalyticsSettings(
    userId: string,
    updateDto: UpdateAnalyticsSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.analyticsSettings = {
      ...user.analyticsSettings,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  // Privacy Settings
  async getPrivacySettings(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.privacySettings;
  }

  async updatePrivacySettings(
    userId: string,
    updateDto: UpdatePrivacySettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.privacySettings = {
      ...user.privacySettings,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  // Advanced Settings
  async getAdvancedSettings(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.advancedSettings;
  }

  async updateAdvancedSettings(
    userId: string,
    updateDto: UpdateAdvancedSettingsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.advancedSettings = {
      ...user.advancedSettings,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }

  // Reset all settings to defaults
  async resetAllSettings(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.preferences = {
      language: 'english',
      tone: 'friendly',
      autoSave: true,
      darkMode: false,
    };

    user.notificationSettings = {
      email: true,
      push: true,
      contentReady: true,
      weeklyReport: true,
      aiSuggestions: true,
    };

    user.aiSettings = {
      aiPriority: 'balanced',
      autoEnhance: true,
      smartHashtags: true,
      contentNotifications: true,
      experimentalFeatures: false,
      visualStyle: 'clean',
      captionLength: 'medium',
      emojiUsage: 'moderate',
    };

    user.schedulingSettings = {
      autoScheduling: true,
      optimizeTiming: true,
      minBuffer: 2,
      maxPostsPerDay: 3,
      postingSchedule: {
        monday: ['09:00', '14:00', '19:00'],
        tuesday: ['09:00', '14:00', '19:00'],
        wednesday: ['09:00', '14:00', '19:00'],
        thursday: ['09:00', '14:00', '19:00'],
        friday: ['09:00', '14:00', '19:00'],
        saturday: ['11:00', '17:00'],
        sunday: ['11:00', '17:00'],
      },
    };

    user.analyticsSettings = {
      weeklyReportDay: 'monday',
      includeReach: true,
      includeEngagement: true,
      includeGrowth: true,
      includeTopPosts: true,
      trackClicks: true,
      trackVisits: true,
      trackDemographics: false,
    };

    user.privacySettings = {
      storeDrafts: true,
      cacheContent: true,
      analyticsCollection: true,
      profileVisibility: 'public',
      shareAnalytics: 'team',
    };

    user.advancedSettings = {
      debugMode: false,
      apiLogs: false,
      betaFeatures: false,
      aiModelTesting: false,
      imageQuality: 'high',
      cacheDuration: 7,
    };

    user.platformPreferences = {
      autoCrosspost: true,
      platformOptimizations: true,
      tagLocation: false,
    };

    await this.usersRepository.save(user);
  }

  // Platform Preferences
  async getPlatformPreferences(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.platformPreferences;
  }

  async updatePlatformPreferences(
    userId: string,
    updateDto: UpdatePlatformPreferencesDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.platformPreferences = {
      ...user.platformPreferences,
      ...updateDto,
    };

    return this.usersRepository.save(user);
  }
}
