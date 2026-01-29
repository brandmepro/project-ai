import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AIModel } from './ai-model.entity';

@Entity('ai_user_preferences')
@Unique(['userId', 'modelId', 'categoryKey'])
export class AIUserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'model_id' })
  modelId: string;

  @ManyToOne(() => AIModel)
  @JoinColumn({ name: 'model_id' })
  model: AIModel;

  @Column({ name: 'category_key' })
  categoryKey: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'preference_score' })
  preferenceScore: number;

  @Column({ type: 'int', default: 0, name: 'total_interactions' })
  totalInteractions: number;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  dislikes: number;

  @Column({ type: 'int', default: 0 })
  regenerates: number;

  @Column({ type: 'int', default: 0 })
  skips: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'average_quality_rating' })
  averageQualityRating: number | null;

  @Column({ type: 'int', default: 0, name: 'total_ratings' })
  totalRatings: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_used_at' })
  lastUsedAt: Date | null;

  @Column({ type: 'timestamp', name: 'first_used_at', default: () => 'CURRENT_TIMESTAMP' })
  firstUsedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
