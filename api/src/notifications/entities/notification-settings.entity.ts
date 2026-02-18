import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true, name: 'user_id' })
  userId: number;

  @OneToOne(() => User, user => user.notificationSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'boolean', default: true })
  email: boolean;

  @Column({ type: 'boolean', default: true })
  push: boolean;

  @Column({ type: 'boolean', default: true, name: 'content_ready' })
  contentReady: boolean;

  @Column({ type: 'boolean', default: true, name: 'weekly_report' })
  weeklyReport: boolean;

  @Column({ type: 'boolean', default: true, name: 'ai_suggestions' })
  aiSuggestions: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
