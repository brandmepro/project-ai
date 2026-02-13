import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true, name: 'user_id' })
  userId: number;

  @OneToOne(() => User, user => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // AI Settings
  @Column({ type: 'varchar', default: 'balanced', name: 'ai_priority' })
  aiPriority: string;

  @Column({ type: 'boolean', default: true, name: 'auto_enhance' })
  autoEnhance: boolean;

  @Column({ type: 'boolean', default: true, name: 'smart_hashtags' })
  smartHashtags: boolean;

  @Column({ type: 'varchar', default: 'medium', name: 'caption_length' })
  captionLength: string;

  @Column({ type: 'varchar', default: 'moderate', name: 'emoji_usage' })
  emojiUsage: string;

  @Column({ type: 'varchar', default: 'clean', name: 'visual_style' })
  visualStyle: string;

  @Column({ type: 'boolean', default: true, name: 'content_notifications' })
  contentNotifications: boolean;

  @Column({ type: 'boolean', default: false, name: 'experimental_features' })
  experimentalFeatures: boolean;

  // Preferences
  @Column({ type: 'varchar', default: 'auto' })
  theme: string;

  @Column({ type: 'varchar', default: 'english' })
  language: string;

  @Column({ type: 'varchar', default: 'UTC' })
  timezone: string;

  @Column({ type: 'boolean', default: true, name: 'auto_save' })
  autoSave: boolean;

  @Column({ type: 'boolean', default: false, name: 'dark_mode' })
  darkMode: boolean;

  // Scheduling
  @Column({ type: 'boolean', default: true, name: 'auto_scheduling' })
  autoScheduling: boolean;

  @Column({ type: 'integer', default: 2, name: 'min_buffer_hours' })
  minBufferHours: number;

  @Column({ type: 'integer', default: 10, name: 'max_posts_per_day' })
  maxPostsPerDay: number;

  // Analytics
  @Column({ type: 'boolean', default: true, name: 'track_clicks' })
  trackClicks: boolean;

  @Column({ type: 'boolean', default: true, name: 'track_visits' })
  trackVisits: boolean;

  @Column({ type: 'boolean', default: true, name: 'include_reach' })
  includeReach: boolean;

  @Column({ type: 'boolean', default: true, name: 'store_drafts' })
  storeDrafts: boolean;

  @Column({ type: 'boolean', default: true, name: 'cache_content' })
  cacheContent: boolean;

  // Privacy
  @Column({ type: 'varchar', default: 'private', name: 'share_analytics' })
  shareAnalytics: string;

  @Column({ type: 'boolean', default: false, name: 'api_logs' })
  apiLogs: boolean;

  @Column({ type: 'boolean', default: false, name: 'debug_mode' })
  debugMode: boolean;

  @Column({ type: 'boolean', default: false, name: 'beta_features' })
  betaFeatures: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
