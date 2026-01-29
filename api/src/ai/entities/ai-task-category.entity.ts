import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_task_categories')
export class AITaskCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'category_key' })
  categoryKey: string;

  @Column({ name: 'category_name' })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', array: true, default: [], name: 'required_capabilities' })
  requiredCapabilities: string[];

  @Column({ type: 'text', array: true, default: [], name: 'preferred_capabilities' })
  preferredCapabilities: string[];

  @Column({ default: 'balanced', name: 'default_priority' })
  defaultPriority: string;

  @Column({ default: 'moderate', name: 'default_complexity' })
  defaultComplexity: string;

  @Column({ type: 'int', nullable: true, name: 'typical_max_tokens' })
  typicalMaxTokens: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'typical_temperature' })
  typicalTemperature: number;

  @Column({ nullable: true, name: 'parent_category' })
  parentCategory: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
