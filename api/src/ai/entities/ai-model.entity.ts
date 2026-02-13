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

  @Column({ default: false, name: 'supports_image_gen' })
  supportsImageGen: boolean;

  @Column({ default: false, name: 'supports_video_gen' })
  supportsVideoGen: boolean;

  @Column({ default: false, name: 'supports_web_search' })
  supportsWebSearch: boolean;

  @Column({ type: 'int', nullable: true, name: 'max_tokens' })
  maxTokens: number;

  @Column({ type: 'int', nullable: true, name: 'context_window' })
  contextWindow: number;

  @Column({ type: 'text', array: true, default: [], name: 'available_providers' })
  availableProviders: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'latency_ms' })
  latencyMs: number;

  @Column({ type: 'int', nullable: true, name: 'throughput_tps' })
  throughputTps: number;

  @Column({ name: 'cost_bucket' })
  costBucket: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'cost_per_1m_input' })
  costPer1mInput: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'cost_per_1m_output' })
  costPer1mOutput: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'cache_read_cost_per_1m' })
  cacheReadCostPer1m: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'cache_write_cost_per_1m' })
  cacheWriteCostPer1m: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'image_gen_cost' })
  imageGenCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'video_gen_cost' })
  videoGenCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'web_search_cost' })
  webSearchCost: number;

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
