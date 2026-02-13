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
import { Platform } from '../../common/enums';

@Entity('platform_connections')
export class PlatformConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ default: false, name: 'is_connected' })
  isConnected: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'access_token' })
  accessToken: string;

  @Column({ type: 'varchar', nullable: true, name: 'refresh_token' })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true, name: 'token_expires_at' })
  tokenExpiresAt: Date;

  @Column({ type: 'jsonb', default: {}, name: 'platform_data' })
  platformData: {
    accountId?: string;
    accountName?: string;
    profilePicture?: string;
    followers?: number;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'connected_at' })
  connectedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
