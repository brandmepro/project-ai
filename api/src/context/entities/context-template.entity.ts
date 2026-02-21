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

/**
 * Template Category
 */
export enum TemplateCategory {
  PRODUCT = 'product', // Product descriptions
  SERVICE = 'service', // Service offerings
  CAMPAIGN = 'campaign', // Campaign-specific context
  SEASONAL = 'seasonal', // Holiday/seasonal content
  PROMOTION = 'promotion', // Promotional content
  ANNOUNCEMENT = 'announcement', // Business announcements
  EVENT = 'event', // Event-related content
  CUSTOM = 'custom', // User-defined templates
}

/**
 * Context Template Entity
 * Reusable context snippets for common scenarios
 */
@Entity('context_templates')
export class ContextTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Template Information
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
    default: TemplateCategory.CUSTOM,
  })
  category: TemplateCategory;

  // Template Content
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', default: {} })
  variables: {
    [key: string]: string; // Key-value pairs for template variables
  };

  // Usage Context
  @Column({ type: 'text', array: true, default: '{}', name: 'applicable_platforms' })
  applicablePlatforms: string[];

  @Column({ type: 'text', array: true, default: '{}', name: 'applicable_task_types' })
  applicableTaskTypes: string[]; // e.g., ["caption_generation", "idea_generation"]

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  // Usage Tracking
  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date;

  @Column({ type: 'float', default: 0, name: 'effectiveness_score' })
  effectivenessScore: number; // 0-1, based on outcomes when used

  // Metadata
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_favorite' })
  isFavorite: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number; // Higher priority = used first

  @Column({ type: 'jsonb', default: {}, name: 'custom_metadata' })
  customMetadata: Record<string, any>;

  // Scheduling
  @Column({ type: 'date', nullable: true, name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'valid_until' })
  validUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
