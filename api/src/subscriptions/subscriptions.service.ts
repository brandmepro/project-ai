import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async findByUserId(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      // Create default free subscription if it doesn't exist
      return this.create(userId);
    }

    return subscription;
  }

  async create(userId: number, plan: string = 'free'): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      userId,
      plan,
      status: 'active',
    });

    return this.subscriptionRepository.save(subscription);
  }

  async updatePlan(
    userId: number,
    plan: string,
    billingCycle?: string,
  ): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);

    subscription.plan = plan;
    if (billingCycle) {
      subscription.billingCycle = billingCycle;
    }

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(userId: number, immediately: boolean = false): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);

    if (immediately) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    return this.subscriptionRepository.save(subscription);
  }

  async isActive(userId: number): Promise<boolean> {
    const subscription = await this.findByUserId(userId);
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  async hasFeatureAccess(userId: number, feature: string): Promise<boolean> {
    const subscription = await this.findByUserId(userId);
    
    // Define feature access per plan
    const features = {
      free: ['basic_ai', 'single_platform'],
      starter: ['basic_ai', 'multi_platform', 'scheduling'],
      professional: ['advanced_ai', 'multi_platform', 'scheduling', 'analytics'],
      enterprise: ['advanced_ai', 'multi_platform', 'scheduling', 'analytics', 'priority_support'],
    };

    return features[subscription.plan]?.includes(feature) || false;
  }
}
