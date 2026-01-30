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
