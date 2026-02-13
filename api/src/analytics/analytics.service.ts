import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Content } from '../content/entities/content.entity';
import { ContentStatus, Platform } from '../common/enums';
import { DateRange } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  private getDateRangeStart(range: DateRange): Date {
    const now = new Date();
    const daysMap = {
      [DateRange.SEVEN_DAYS]: 7,
      [DateRange.THIRTY_DAYS]: 30,
      [DateRange.NINETY_DAYS]: 90,
    };
    const days = daysMap[range] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return startDate;
  }

  async getOverviewStats(userId: number, range: DateRange) {
    const startDate = this.getDateRangeStart(range);
    const endDate = new Date();

    // Get current period stats
    const currentPeriodContent = await this.contentRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate) as any,
      },
    });

    // Calculate previous period for growth
    const periodDays =
      Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    const previousPeriodContent = await this.contentRepository.find({
      where: {
        userId,
        createdAt: Between(previousStartDate, startDate) as any,
      },
    });

    // Calculate engagement metrics
    const currentEngagement = currentPeriodContent.reduce((sum, content) => {
      const likes = content.engagement?.likes || 0;
      const comments = content.engagement?.comments || 0;
      const shares = content.engagement?.shares || 0;
      return sum + likes + comments + shares;
    }, 0);

    const previousEngagement = previousPeriodContent.reduce((sum, content) => {
      const likes = content.engagement?.likes || 0;
      const comments = content.engagement?.comments || 0;
      const shares = content.engagement?.shares || 0;
      return sum + likes + comments + shares;
    }, 0);

    const currentReach = currentPeriodContent.reduce(
      (sum, content) => sum + (content.engagement?.reach || 0),
      0,
    );
    const previousReach = previousPeriodContent.reduce(
      (sum, content) => sum + (content.engagement?.reach || 0),
      0,
    );

    const currentPosts = currentPeriodContent.filter(
      (c) => c.status === ContentStatus.PUBLISHED,
    ).length;
    const previousPosts = previousPeriodContent.filter(
      (c) => c.status === ContentStatus.PUBLISHED,
    ).length;

    // Calculate growth percentages
    const engagementGrowth =
      previousEngagement > 0
        ? ((currentEngagement - previousEngagement) / previousEngagement) * 100
        : currentEngagement > 0
          ? 100
          : 0;

    const reachGrowth =
      previousReach > 0
        ? ((currentReach - previousReach) / previousReach) * 100
        : currentReach > 0
          ? 100
          : 0;

    const postsGrowth =
      previousPosts > 0
        ? ((currentPosts - previousPosts) / previousPosts) * 100
        : currentPosts > 0
          ? 100
          : 0;

    // Followers growth (mock data for now - would come from social platform APIs)
    const followersGrowth = 12.5;

    return {
      totalEngagement: currentEngagement,
      engagementGrowth: Math.round(engagementGrowth * 10) / 10,
      totalReach: currentReach,
      reachGrowth: Math.round(reachGrowth * 10) / 10,
      postsPublished: currentPosts,
      postsGrowth: Math.round(postsGrowth * 10) / 10,
      followers: 1250, // Mock data
      followersGrowth,
    };
  }

  async getEngagementData(userId: number, range: DateRange) {
    const days =
      range === DateRange.SEVEN_DAYS
        ? 7
        : range === DateRange.THIRTY_DAYS
          ? 30
          : 90;
    const startDate = this.getDateRangeStart(range);
    const endDate = new Date();

    const content = await this.contentRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate) as any,
      },
    });

    // Group by day
    const dailyData = new Map<string, { posts: number; engagement: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayKey = date.toISOString().split('T')[0];
      dailyData.set(dayKey, { posts: 0, engagement: 0 });
    }

    content.forEach((item) => {
      const dayKey = item.createdAt.toISOString().split('T')[0];
      if (dailyData.has(dayKey)) {
        const data = dailyData.get(dayKey);
        data.posts += 1;
        data.engagement +=
          (item.engagement?.likes || 0) +
          (item.engagement?.comments || 0) +
          (item.engagement?.shares || 0);
      }
    });

    return Array.from(dailyData.entries()).map(([day, data]) => ({
      day,
      posts: data.posts,
      engagement: data.engagement,
    }));
  }

  async getPlatformStats(userId: number, range: DateRange) {
    const startDate = this.getDateRangeStart(range);
    const endDate = new Date();

    const content = await this.contentRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate) as any,
      },
    });

    const platformMap = new Map<
      Platform,
      { posts: number; engagement: number }
    >();

    // Initialize all platforms
    Object.values(Platform).forEach((platform) => {
      platformMap.set(platform, { posts: 0, engagement: 0 });
    });

    content.forEach((item) => {
      const data = platformMap.get(item.platform);
      if (data) {
        data.posts += 1;
        data.engagement +=
          (item.engagement?.likes || 0) +
          (item.engagement?.comments || 0) +
          (item.engagement?.shares || 0);
      }
    });

    return Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      posts: data.posts,
      engagement: data.engagement,
    }));
  }

  async getTopContent(userId: number, limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const content = await this.contentRepository.find({
      where: {
        userId,
        status: ContentStatus.PUBLISHED,
        publishedAt: Between(thirtyDaysAgo, new Date()) as any,
      },
    });

    // Sort by total engagement
    const sorted = content
      .map((item) => ({
        id: item.id,
        title: item.caption.substring(0, 50) + '...',
        platform: item.platform,
        engagement:
          (item.engagement?.likes || 0) +
          (item.engagement?.comments || 0) +
          (item.engagement?.shares || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);

    return sorted;
  }
}
