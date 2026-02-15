import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { BusinessType } from '../common/enums';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';
import { UpdateSchedulingSettingsDto } from './dto/update-scheduling-settings.dto';
import { UpdateAnalyticsSettingsDto } from './dto/update-analytics-settings.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { UpdateAdvancedSettingsDto } from './dto/update-advanced-settings.dto';
import { UpdatePlatformPreferencesDto } from '../platforms/dto/update-platform-preferences.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      businessName: user.businessName,
      businessType: user.businessType,
      businessDescription: user.businessDescription,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      oauthProvider: user.oauthProvider,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  @Post('onboarding/complete')
  @ApiOperation({ 
    summary: 'Complete onboarding for OAuth users',
    description: 'OAuth users must provide business information after signup'
  })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  async completeOnboarding(
    @CurrentUser('id') userId: number,
    @Body() completeOnboardingDto: CompleteOnboardingDto,
  ) {
    const user = await this.usersService.completeOnboarding(
      userId,
      completeOnboardingDto.businessName,
      completeOnboardingDto.businessType,
      completeOnboardingDto.goals,
    );

    return {
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        businessName: user.businessName,
        businessType: user.businessType,
        contentGoals: user.contentGoals,
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() updates: { name?: string; businessType?: BusinessType },
  ) {
    return this.usersService.updateProfile(userId, updates);
  }

  @Patch('business-profile')
  @ApiOperation({ summary: 'Update business profile' })
  @ApiResponse({ status: 200, description: 'Business profile updated' })
  async updateBusinessProfile(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateBusinessProfileDto,
  ) {
    return this.usersService.updateBusinessProfile(userId, updateDto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences returned' })
  async getPreferences(@CurrentUser('id') userId: number) {
    return this.usersService.getPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(userId, updateDto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings returned' })
  async getNotifications(@CurrentUser('id') userId: number) {
    return this.usersService.getNotificationSettings(userId);
  }

  @Patch('notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated' })
  async updateNotifications(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateNotificationsDto,
  ) {
    return this.usersService.updateNotifications(userId, updateDto);
  }

  @Post('password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    return { message: 'Password changed successfully' };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @CurrentUser('id') userId: number,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    return this.usersService.updateAvatar(userId, avatarUrl);
  }

  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async enable2FA(
    @CurrentUser('id') userId: number,
    @Body('secret') secret: string,
  ) {
    return this.usersService.enable2FA(userId, secret);
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(@CurrentUser('id') userId: number) {
    return this.usersService.disable2FA(userId);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  async deleteAccount(@CurrentUser('id') userId: number) {
    await this.usersService.deleteAccount(userId);
    return { message: 'Account deleted successfully' };
  }

  // AI Settings
  @Get('settings/ai')
  @ApiOperation({ summary: 'Get AI settings' })
  @ApiResponse({ status: 200, description: 'AI settings returned' })
  async getAiSettings(@CurrentUser('id') userId: number) {
    return this.usersService.getAiSettings(userId);
  }

  @Patch('settings/ai')
  @ApiOperation({ summary: 'Update AI settings' })
  @ApiResponse({ status: 200, description: 'AI settings updated' })
  async updateAiSettings(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateAiSettingsDto,
  ) {
    return this.usersService.updateAiSettings(userId, updateDto);
  }

  // Scheduling Settings
  @Get('settings/scheduling')
  @ApiOperation({ summary: 'Get scheduling settings' })
  @ApiResponse({ status: 200, description: 'Scheduling settings returned' })
  async getSchedulingSettings(@CurrentUser('id') userId: number) {
    return this.usersService.getSchedulingSettings(userId);
  }

  @Patch('settings/scheduling')
  @ApiOperation({ summary: 'Update scheduling settings' })
  @ApiResponse({ status: 200, description: 'Scheduling settings updated' })
  async updateSchedulingSettings(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateSchedulingSettingsDto,
  ) {
    return this.usersService.updateSchedulingSettings(userId, updateDto);
  }

  // Analytics Settings
  @Get('settings/analytics')
  @ApiOperation({ summary: 'Get analytics settings' })
  @ApiResponse({ status: 200, description: 'Analytics settings returned' })
  async getAnalyticsSettings(@CurrentUser('id') userId: number) {
    return this.usersService.getAnalyticsSettings(userId);
  }

  @Patch('settings/analytics')
  @ApiOperation({ summary: 'Update analytics settings' })
  @ApiResponse({ status: 200, description: 'Analytics settings updated' })
  async updateAnalyticsSettings(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateAnalyticsSettingsDto,
  ) {
    return this.usersService.updateAnalyticsSettings(userId, updateDto);
  }

  // Privacy Settings
  @Get('settings/privacy')
  @ApiOperation({ summary: 'Get privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings returned' })
  async getPrivacySettings(@CurrentUser('id') userId: number) {
    return this.usersService.getPrivacySettings(userId);
  }

  @Patch('settings/privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated' })
  async updatePrivacySettings(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdatePrivacySettingsDto,
  ) {
    return this.usersService.updatePrivacySettings(userId, updateDto);
  }

  // Advanced Settings
  @Get('settings/advanced')
  @ApiOperation({ summary: 'Get advanced settings' })
  @ApiResponse({ status: 200, description: 'Advanced settings returned' })
  async getAdvancedSettings(@CurrentUser('id') userId: number) {
    return this.usersService.getAdvancedSettings(userId);
  }

  @Patch('settings/advanced')
  @ApiOperation({ summary: 'Update advanced settings' })
  @ApiResponse({ status: 200, description: 'Advanced settings updated' })
  async updateAdvancedSettings(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdateAdvancedSettingsDto,
  ) {
    return this.usersService.updateAdvancedSettings(userId, updateDto);
  }

  // Platform Preferences
  @Get('settings/platforms')
  @ApiOperation({ summary: 'Get platform preferences' })
  @ApiResponse({ status: 200, description: 'Platform preferences returned' })
  async getPlatformPreferences(@CurrentUser('id') userId: number) {
    return this.usersService.getPlatformPreferences(userId);
  }

  @Patch('settings/platforms')
  @ApiOperation({ summary: 'Update platform preferences' })
  @ApiResponse({ status: 200, description: 'Platform preferences updated' })
  async updatePlatformPreferences(
    @CurrentUser('id') userId: number,
    @Body() updateDto: UpdatePlatformPreferencesDto,
  ) {
    return this.usersService.updatePlatformPreferences(userId, updateDto);
  }

  // Reset Settings
  @Post('settings/reset')
  @ApiOperation({ summary: 'Reset all settings to defaults' })
  @ApiResponse({ status: 200, description: 'Settings reset successfully' })
  async resetAllSettings(@CurrentUser('id') userId: number) {
    await this.usersService.resetAllSettings(userId);
    return { message: 'All settings have been reset to defaults' };
  }
}
