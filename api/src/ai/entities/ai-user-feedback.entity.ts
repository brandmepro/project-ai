import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AILog } from './ai-log.entity';
import { AIModel } from './ai-model.entity';

@Entity('ai_user_feedback')
export class AIUserFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'ai_log_id' })
  aiLogId: string;

  @ManyToOne(() => AILog)
  @JoinColumn({ name: 'ai_log_id' })
  aiLog: AILog;

  @Column({ type: 'uuid', nullable: true, name: 'model_id' })
  modelId: string;

  @ManyToOne(() => AIModel)
  @JoinColumn({ name: 'model_id' })
  model: AIModel;

  @Column({ name: 'category_key' })
  categoryKey: string;

  @Column({ name: 'feedback_type' })
  feedbackType: string;

  @Column({ type: 'int', nullable: true, name: 'quality_rating' })
  qualityRating: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true, name: 'prompt_summary' })
  promptSummary: string;

  @Column({ type: 'text', nullable: true, name: 'output_summary' })
  outputSummary: string;

  @Column({ nullable: true, name: 'session_id' })
  sessionId: string;

  @Column({ nullable: true, name: 'device_type' })
  deviceType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
