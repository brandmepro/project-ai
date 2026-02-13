import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  ContentStatus,
  Platform,
  BusinessType,
  ContentGoal,
  Tone,
  Language,
  VisualStyle,
} from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'text' })
  caption: string;

  @Column({ type: 'text', array: true, default: [] })
  hashtags: string[];

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'varchar', default: 'post', name: 'content_type' })
  contentType: string;

  @Column({ type: 'enum', enum: ContentStatus, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({
    type: 'enum',
    enum: BusinessType,
    nullable: true,
    name: 'business_type',
  })
  businessType: BusinessType;

  @Column({
    type: 'enum',
    enum: ContentGoal,
    nullable: true,
    name: 'content_goal',
  })
  contentGoal: ContentGoal;

  @Column({ type: 'enum', enum: Tone, nullable: true })
  tone: Tone;

  @Column({ type: 'enum', enum: Language, nullable: true })
  language: Language;

  @Column({
    type: 'enum',
    enum: VisualStyle,
    nullable: true,
    name: 'visual_style',
  })
  visualStyle: VisualStyle;

  @Column({ nullable: true, name: 'ai_idea_id' })
  aiIdeaId: string;

  @Column({ type: 'int', nullable: true, name: 'engagement_estimate' })
  engagementEstimate: number;

  @Column({ type: 'jsonb', default: {}, name: 'engagement' })
  engagement: {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
  };

  @Column({ type: 'text', array: true, default: [], name: 'ai_tags' })
  aiTags: string[];

  @Column({ type: 'text', array: true, default: [], name: 'media_urls' })
  mediaUrls: string[];

  @Column({ type: 'jsonb', default: {}, name: 'media_metadata' })
  mediaMetadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_for' })
  scheduledFor: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
