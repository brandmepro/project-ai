import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_models')
export class AIModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'model_id' })
  modelId: string;

  @Column({ name: 'model_name' })
  modelName: string;

  @Column()
  provider: string;

  @Column({ nullable: true })
  version: string;

  @Column({ type: 'text', array: true, default: [] })
  capabilities: string[];

  @Column({ default: false, name: 'supports_streaming' })
  supportsStreaming: boolean;

  @Column({ default: false, name: 'supports_json_mode' })
  supportsJsonMode: boolean;

  @Column({ default: false, name: 'supports_function_calling' })
  supportsFunctionCalling: boolean;

  @Column({ default: false, name: 'supports_vision' })
  supportsVision: boolean;

  @Column({ type: 'int', nullable: true, name: 'max_tokens' })
  maxTokens: number;

  @Column({ type: 'int', nullable: true, name: 'context_window' })
  contextWindow: number;

  @Column({ type: 'int', nullable: true, name: 'average_speed_ms' })
  averageSpeedMs: number;

  @Column({ name: 'cost_bucket' })
  costBucket: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'cost_per_1k_input' })
  costPer1kInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'cost_per_1k_output' })
  costPer1kOutput: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'overall_quality_score' })
  overallQualityScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'reliability_score' })
  reliabilityScore: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_recommended' })
  isRecommended: boolean;

  @Column({ type: 'int', default: 0, name: 'priority_rank' })
  priorityRank: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', array: true, default: [], name: 'use_cases' })
  useCases: string[];

  @Column({ type: 'text', nullable: true })
  limitations: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deprecated_at' })
  deprecatedAt: Date;
}
