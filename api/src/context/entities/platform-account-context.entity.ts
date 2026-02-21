import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Platform } from '../../common/enums';

/**
 * Audience Demographics per Platform
 */
export interface AudienceDemographics {
  ageGroups?: Record<string, number>; // e.g., { "18-24": 30, "25-34": 45 }
  genderSplit?: Record<string, number>; // e.g., { "male": 45, "female": 55 }
  topLocations?: string[];
  interests?: string[];
  activeHours?: string[]; // e.g., ["7-9 AM", "6-8 PM"]
}

/**
 * Performance Metrics per Platform
 */
export interface PerformanceMetrics {
  averageEngagementRate?: number;
  averageReach?: number;
  averageLikes?: number;
  averageComments?: number;
  averageShares?: number;
  bestPostingTimes?: string[];
  topPerformingContentTypes?: string[];
  topPerformingHashtags?: string[];
}

/**
 * Content Strategy per Platform
 */
export interface ContentStrategy {
  optimalPostLength?: string;
  emojiUsage?: 'minimal' | 'moderate' | 'heavy';
  hashtagStrategy?: string;
  callToActionPreference?: string[];
  contentPillars?: string[]; // Main themes to focus on
}

/**
 * Platform Account Context Entity
 * Stores per-platform context for AI optimization
 */
@Entity('platform_account_contexts')
export class PlatformAccountContext {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  // Account Information
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'account_handle' })
  accountHandle: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'account_name' })
  accountName: string;

  @Column({ type: 'text', nullable: true, name: 'account_bio' })
  accountBio: string;

  @Column({ type: 'varchar', nullable: true, name: 'profile_image_url' })
  profileImageUrl: string;

  // Audience Insights
  @Column({ type: 'int', default: 0, name: 'followers_count' })
  followersCount: number;

  @Column({ type: 'int', default: 0, name: 'following_count' })
  followingCount: number;

  @Column({ type: 'jsonb', default: {}, name: 'audience_demographics' })
  audienceDemographics: AudienceDemographics;

  @Column({ type: 'text', nullable: true, name: 'audience_description' })
  audienceDescription: string;

  // Performance Data
  @Column({ type: 'jsonb', default: {}, name: 'performance_metrics' })
  performanceMetrics: PerformanceMetrics;

  @Column({ type: 'jsonb', default: {}, name: 'historical_data' })
  historicalData: {
    totalPosts?: number;
    lastPostDate?: string;
    avgPostsPerWeek?: number;
    bestPerformingPost?: {
      id?: string;
      engagement?: number;
      date?: string;
    };
  };

  // Platform-Specific Strategy
  @Column({ type: 'jsonb', default: {}, name: 'content_strategy' })
  contentStrategy: ContentStrategy;

  @Column({ type: 'text', array: true, default: '{}', name: 'successful_campaigns' })
  successfulCampaigns: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'content_preferences' })
  contentPreferences: string[];

  // Platform-Specific Optimization
  @Column({ type: 'text', nullable: true, name: 'optimal_posting_schedule' })
  optimalPostingSchedule: string;

  @Column({ type: 'text', array: true, default: '{}', name: 'high_performing_topics' })
  highPerformingTopics: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'low_performing_topics' })
  lowPerformingTopics: string[];

  // Engagement Patterns
  @Column({ type: 'float', default: 0, name: 'average_engagement_rate' })
  averageEngagementRate: number;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'best_content_format' })
  bestContentFormat: string; // e.g., "carousel", "reels", "static"

  @Column({ type: 'text', array: true, default: '{}', name: 'top_hashtags' })
  topHashtags: string[];

  // Learning and Insights
  @Column({ type: 'text', nullable: true, name: 'learnings_notes' })
  learningsNotes: string;

  @Column({ type: 'jsonb', default: {}, name: 'ab_test_results' })
  abTestResults: Record<string, any>;

  // Additional Context
  @Column({ type: 'jsonb', default: {}, name: 'custom_context' })
  customContext: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true, name: 'last_synced_at' })
  lastSyncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
