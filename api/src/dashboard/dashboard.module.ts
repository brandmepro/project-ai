import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ContentModule } from '../content/content.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ContentModule, AnalyticsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
