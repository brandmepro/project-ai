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

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'free' })
  plan: string; // free, starter, professional, enterprise

  @Column({ default: 'active' })
  status: string; // active, canceled, past_due, trialing, incomplete

  @Column({ nullable: true, name: 'billing_cycle' })
  billingCycle: string; // monthly, yearly

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'timestamp', nullable: true, name: 'trial_ends_at' })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'current_period_start' })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'current_period_end' })
  currentPeriodEnd: Date;

  @Column({ default: false, name: 'cancel_at_period_end' })
  cancelAtPeriodEnd: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'canceled_at' })
  canceledAt: Date;

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripeCustomerId: string;

  @Column({ nullable: true, name: 'stripe_subscription_id' })
  stripeSubscriptionId: string;

  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_payment_at' })
  lastPaymentAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'next_payment_at' })
  nextPaymentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
