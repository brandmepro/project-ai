import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('my-subscription')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Subscription details returned' })
  async getMySubscription(@CurrentUser('id') userId: number) {
    return this.subscriptionsService.findByUserId(userId);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan upgraded successfully' })
  async upgradePlan(
    @CurrentUser('id') userId: number,
    @Body() body: { plan: string; billingCycle?: string },
  ) {
    return this.subscriptionsService.updatePlan(
      userId,
      body.plan,
      body.billingCycle,
    );
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled' })
  async cancelSubscription(
    @CurrentUser('id') userId: number,
    @Body() body: { immediately?: boolean },
  ) {
    return this.subscriptionsService.cancel(userId, body.immediately);
  }

  @Get('feature/:feature')
  @ApiOperation({ summary: 'Check if user has access to a feature' })
  @ApiResponse({ status: 200, description: 'Feature access checked' })
  async checkFeatureAccess(
    @CurrentUser('id') userId: number,
    @Param('feature') feature: string,
  ) {
    const hasAccess = await this.subscriptionsService.hasFeatureAccess(
      userId,
      feature,
    );
    return { hasAccess };
  }
}
