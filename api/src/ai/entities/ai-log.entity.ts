import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('ai_logs')
export class AILog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ length: 100 })
  feature: string;

  @Column({ length: 50, name: 'model_enum' })
  modelEnum: string;

  @Column({ length: 50, nullable: true })
  provider: string;

  @Column({ length: 100, nullable: true, name: 'model_name' })
  modelName: string;

  @Column({ length: 20, name: 'cost_bucket' })
  costBucket: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'estimated_cost_usd' })
  estimatedCostUsd: number;

  @Column({ type: 'int', nullable: true, name: 'prompt_tokens' })
  promptTokens: number;

  @Column({ type: 'int', nullable: true, name: 'completion_tokens' })
  completionTokens: number;

  @Column({ type: 'int', nullable: true, name: 'total_tokens' })
  totalTokens: number;

  @Column({ type: 'jsonb', nullable: true, name: 'input_data' })
  inputData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'output_data' })
  outputData: Record<string, any>;

  @Column({ type: 'int', nullable: true, name: 'duration_ms' })
  durationMs: number;

  @Column({ default: 'success' })
  status: string;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  @Column({ nullable: true, name: 'category_key' })
  categoryKey: string | null;

  @Column({ nullable: true, name: 'task_priority' })
  taskPriority: string | null;

  @Column({ nullable: true, name: 'task_complexity' })
  taskComplexity: string | null;

  @Column({ default: 'auto', name: 'selected_by' })
  selectedBy: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'confidence_score' })
  confidenceScore: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
