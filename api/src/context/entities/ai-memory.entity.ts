import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Memory Category Types
 */
export enum MemoryCategory {
  PREFERENCE = 'preference', // User preferences and style choices
  PERFORMANCE_INSIGHT = 'performance_insight', // What works well
  STYLE_PREFERENCE = 'style_preference', // Writing/content style
  BUSINESS_INFO = 'business_info', // Business-specific facts
  AUDIENCE_INSIGHT = 'audience_insight', // Audience behavior and preferences
  CORRECTION = 'correction', // User corrections to AI outputs
  SUCCESS_PATTERN = 'success_pattern', // Patterns that led to success
  AVOID_PATTERN = 'avoid_pattern', // Patterns to avoid
  SEASONAL = 'seasonal', // Seasonal or time-based patterns
  CAMPAIGN = 'campaign', // Campaign-specific learnings
  GENERAL = 'general', // General learnings
}

/**
 * Memory Source - How was this memory created
 */
export enum MemorySource {
  USER_FEEDBACK = 'user_feedback', // From explicit user feedback
  USER_EDIT = 'user_edit', // Learned from user editing AI output
  PERFORMANCE_DATA = 'performance_data', // Learned from analytics
  USER_INPUT = 'user_input', // Directly added by user
  AUTO_LEARNING = 'auto_learning', // Automatically inferred
  SYSTEM = 'system', // System-generated
}

/**
 * AI Memory Entity
 * ChatGPT-style memory system with vector embeddings for semantic search
 */
@Entity('ai_memories')
@Index(['userId', 'category'])
@Index(['userId', 'importance'])
export class AIMemory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Memory Content
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string; // Shorter version for quick context

  @Column({
    type: 'enum',
    enum: MemoryCategory,
    default: MemoryCategory.GENERAL,
  })
  category: MemoryCategory;

  @Column({
    type: 'enum',
    enum: MemorySource,
    default: MemorySource.AUTO_LEARNING,
  })
  source: MemorySource;

  // Vector Embedding for Semantic Search
  // Using JSONB for better compatibility (no pgvector extension needed)
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  embedding: number[];

  // Importance and Relevance
  @Column({ type: 'float', default: 0.5 })
  importance: number; // 0.0 to 1.0

  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number; // How many times this memory was used

  @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date;

  // Context and Metadata
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'related_platform' })
  relatedPlatform: string; // Specific to a platform?

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'related_task_type' })
  relatedTaskType: string; // e.g., "caption_generation", "idea_generation"

  @Column({ type: 'jsonb', default: {}, name: 'context_metadata' })
  contextMetadata: {
    relatedMemoryIds?: string[]; // IDs of related memories
    triggerKeywords?: string[]; // Keywords that should trigger this memory
    confidence?: number; // How confident we are about this memory
    verificationStatus?: 'unverified' | 'verified' | 'disputed';
    [key: string]: any;
  };

  // Expiry and Lifecycle
  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_pinned' })
  isPinned: boolean; // Always include in context

  @Column({ type: 'text', nullable: true, name: 'superseded_by' })
  supersededBy: string; // ID of memory that replaced this one

  // Feedback Loop
  @Column({ type: 'int', default: 0, name: 'positive_feedback_count' })
  positiveFeedbackCount: number;

  @Column({ type: 'int', default: 0, name: 'negative_feedback_count' })
  negativeFeedbackCount: number;

  @Column({ type: 'float', nullable: true, name: 'effectiveness_score' })
  effectivenessScore: number; // Calculated score based on outcomes

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt: Date;
}
