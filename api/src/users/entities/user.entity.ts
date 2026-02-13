import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BusinessType } from '../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true, name: 'business_name' })
  businessName: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    nullable: true,
    name: 'business_type',
  })
  businessType: BusinessType;

  @Column({ type: 'text', array: true, default: '{}', name: 'content_goals' })
  contentGoals: string[];

  @Column({ type: 'text', nullable: true, name: 'business_description' })
  businessDescription: string;

  @Column({ type: 'varchar', nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({
    type: 'varchar',
    default: 'free',
    name: 'subscription_plan',
  })
  subscriptionPlan: string;

  @Column({
    type: 'jsonb',
    default: {
      language: 'english',
      tone: 'friendly',
      autoSave: true,
      darkMode: false,
    },
    name: 'preferences',
  })
  preferences: {
    language?: string;
    tone?: string;
    autoSave?: boolean;
    darkMode?: boolean;
  };

  @Column({
    type: 'jsonb',
    default: {
      email: true,
      push: true,
      contentReady: true,
      weeklyReport: true,
      aiSuggestions: true,
    },
    name: 'notification_settings',
  })
  notificationSettings: {
    email?: boolean;
    push?: boolean;
    contentReady?: boolean;
    weeklyReport?: boolean;
    aiSuggestions?: boolean;
  };

  @Column({
    type: 'jsonb',
    default: {
      aiPriority: 'balanced',
      autoEnhance: true,
      smartHashtags: true,
      contentNotifications: true,
      experimentalFeatures: false,
      visualStyle: 'clean',
      captionLength: 'medium',
      emojiUsage: 'moderate',
    },
    name: 'ai_settings',
  })
  aiSettings: {
    aiPriority?: string;
    autoEnhance?: boolean;
    smartHashtags?: boolean;
    contentNotifications?: boolean;
    experimentalFeatures?: boolean;
    visualStyle?: string;
    captionLength?: string;
    emojiUsage?: string;
  };

  @Column({
    type: 'jsonb',
    default: {
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
    },
    name: 'scheduling_settings',
  })
  schedulingSettings: {
    autoScheduling?: boolean;
    optimizeTiming?: boolean;
    minBuffer?: number;
    maxPostsPerDay?: number;
    postingSchedule?: Record<string, string[]>;
  };

  @Column({
    type: 'jsonb',
    default: {
      weeklyReportDay: 'monday',
      includeReach: true,
      includeEngagement: true,
      includeGrowth: true,
      includeTopPosts: true,
      trackClicks: true,
      trackVisits: true,
      trackDemographics: false,
    },
    name: 'analytics_settings',
  })
  analyticsSettings: {
    weeklyReportDay?: string;
    includeReach?: boolean;
    includeEngagement?: boolean;
    includeGrowth?: boolean;
    includeTopPosts?: boolean;
    trackClicks?: boolean;
    trackVisits?: boolean;
    trackDemographics?: boolean;
  };

  @Column({
    type: 'jsonb',
    default: {
      storeDrafts: true,
      cacheContent: true,
      analyticsCollection: true,
      profileVisibility: 'public',
      shareAnalytics: 'team',
    },
    name: 'privacy_settings',
  })
  privacySettings: {
    storeDrafts?: boolean;
    cacheContent?: boolean;
    analyticsCollection?: boolean;
    profileVisibility?: string;
    shareAnalytics?: string;
  };

  @Column({
    type: 'jsonb',
    default: {
      debugMode: false,
      apiLogs: false,
      betaFeatures: false,
      aiModelTesting: false,
      imageQuality: 'high',
      cacheDuration: 7,
    },
    name: 'advanced_settings',
  })
  advancedSettings: {
    debugMode?: boolean;
    apiLogs?: boolean;
    betaFeatures?: boolean;
    aiModelTesting?: boolean;
    imageQuality?: string;
    cacheDuration?: number;
  };

  @Column({
    type: 'jsonb',
    default: {
      autoCrosspost: true,
      platformOptimizations: true,
      tagLocation: false,
    },
    name: 'platform_preferences',
  })
  platformPreferences: {
    autoCrosspost?: boolean;
    platformOptimizations?: boolean;
    tagLocation?: boolean;
  };

  @Column({ default: false, name: 'two_factor_enabled' })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'two_factor_secret' })
  @Exclude()
  twoFactorSecret: string;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relations will be added as we create other entities
}
