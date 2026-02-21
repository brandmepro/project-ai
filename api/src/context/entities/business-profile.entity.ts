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

/**
 * Brand Voice Configuration
 */
export interface BrandVoice {
  tone: string; // e.g., "friendly and welcoming", "professional", "humorous"
  keywords: string[]; // Words to emphasize
  avoidWords: string[]; // Words to avoid
  styleGuidelines?: string; // Additional style notes
}

/**
 * Product/Service Information
 */
export interface Product {
  name: string;
  description?: string;
  price?: string;
  highlight?: boolean; // Featured product
  category?: string;
}

/**
 * Brand Assets
 */
export interface BrandAssets {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fonts?: string[];
  imageStyle?: string; // e.g., "minimalist", "colorful", "professional"
}

/**
 * Business Profile Entity
 * Stores comprehensive business context for AI personalization
 */
@Entity('business_profiles')
export class BusinessProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Core Business Information
  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 100 })
  businessType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  tagline: string;

  @Column({ type: 'text', nullable: true, name: 'elevator_pitch' })
  elevatorPitch: string;

  // Products and Services
  @Column({ type: 'jsonb', default: [] })
  products: Product[];

  @Column({ type: 'text', array: true, default: '{}', name: 'services_offered' })
  servicesOffered: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'unique_selling_points' })
  uniqueSellingPoints: string[];

  // Brand Identity
  @Column({ type: 'jsonb', default: {}, name: 'brand_voice' })
  brandVoice: BrandVoice;

  @Column({ type: 'jsonb', nullable: true, name: 'brand_assets' })
  brandAssets: BrandAssets;

  @Column({ type: 'text', array: true, default: '{}', name: 'brand_values' })
  brandValues: string[];

  // Target Audience
  @Column({ type: 'text', nullable: true, name: 'target_audience' })
  targetAudience: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'audience_age_range' })
  audienceAgeRange: string; // e.g., "25-35"

  @Column({ type: 'text', array: true, default: '{}', name: 'audience_interests' })
  audienceInterests: string[];

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'audience_location' })
  audienceLocation: string;

  // Business Goals and Metrics
  @Column({ type: 'text', array: true, default: '{}', name: 'business_goals' })
  businessGoals: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'success_metrics' })
  successMetrics: string[];

  @Column({ type: 'text', nullable: true, name: 'marketing_objectives' })
  marketingObjectives: string;

  // Competitors and Market Position
  @Column({ type: 'text', array: true, default: '{}' })
  competitors: string[];

  @Column({ type: 'text', nullable: true, name: 'market_position' })
  marketPosition: string;

  // Content Preferences
  @Column({ type: 'text', array: true, default: '{}', name: 'content_themes' })
  contentThemes: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'content_avoid_topics' })
  contentAvoidTopics: string[];

  @Column({ type: 'text', nullable: true, name: 'content_frequency_preference' })
  contentFrequencyPreference: string;

  // Additional Context
  @Column({ type: 'text', nullable: true, name: 'additional_context' })
  additionalContext: string;

  @Column({ type: 'jsonb', default: {}, name: 'custom_fields' })
  customFields: Record<string, any>;

  // Metadata
  @Column({ type: 'int', default: 0, name: 'completeness_score' })
  completenessScore: number; // 0-100, calculated based on filled fields

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
