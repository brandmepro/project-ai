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
import { Settings } from '../../settings/entities/settings.entity';
import { NotificationSettings } from '../../notifications/entities/notification-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
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

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  // OAuth fields
  @Column({ type: 'varchar', nullable: true, name: 'google_id', unique: true })
  googleId: string;

  @Column({ 
    type: 'varchar', 
    default: 'local', 
    name: 'oauth_provider',
    comment: 'Authentication provider: local, google' 
  })
  oauthProvider: string;

  @Column({ 
    default: true, 
    name: 'onboarding_completed',
    comment: 'Tracks if OAuth users have completed business info collection'
  })
  onboardingCompleted: boolean;

  @Column({
    type: 'varchar',
    default: 'free',
    name: 'subscription_plan',
  })
  subscriptionPlan: string;

  // Relationships to dedicated tables
  @OneToOne(() => Settings, settings => settings.user, { eager: true, cascade: true })
  settings: Settings;

  @OneToOne(() => NotificationSettings, notificationSettings => notificationSettings.user, { eager: true, cascade: true })
  notificationSettings: NotificationSettings;

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
