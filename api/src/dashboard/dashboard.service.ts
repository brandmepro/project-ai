import { Injectable } from '@nestjs/common';
import { ContentService } from '../content/content.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { DateRange } from '../analytics/dto/analytics-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly contentService: ContentService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getDashboardStats(userId: string) {
    const [contentStats, overviewStats, recentContent] = await Promise.all([
      this.contentService.getContentStats(userId),
      this.analyticsService.getOverviewStats(userId, DateRange.THIRTY_DAYS),
      this.contentService.getRecentContent(userId, 4),
    ]);

    return {
      contentStats,
      overview: overviewStats,
      recentContent,
    };
  }

  async getRecentContent(userId: string, limit?: number) {
    return this.contentService.getRecentContent(userId, limit);
  }
}
