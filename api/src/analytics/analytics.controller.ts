import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overview statistics' })
  @ApiResponse({
    status: 200,
    description: 'Overview stats with growth metrics',
  })
  async getOverview(
    @CurrentUser('id') userId: string,
    @Query() queryDto: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getOverviewStats(userId, queryDto.range);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement data over time' })
  @ApiResponse({
    status: 200,
    description: 'Daily engagement data',
  })
  async getEngagement(
    @CurrentUser('id') userId: string,
    @Query() queryDto: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getEngagementData(userId, queryDto.range);
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Get platform performance breakdown' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics by platform',
  })
  async getPlatforms(
    @CurrentUser('id') userId: string,
    @Query() queryDto: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getPlatformStats(userId, queryDto.range);
  }

  @Get('top-content')
  @ApiOperation({ summary: 'Get top performing content' })
  @ApiResponse({
    status: 200,
    description: 'Top content by engagement (last 30 days)',
  })
  async getTopContent(@CurrentUser('id') userId: string) {
    return this.analyticsService.getTopContent(userId);
  }
}
