import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum WeeklyReportDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export class UpdateAnalyticsSettingsDto {
  @ApiProperty({ enum: WeeklyReportDay, required: false })
  @IsEnum(WeeklyReportDay)
  @IsOptional()
  weeklyReportDay?: WeeklyReportDay;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeReach?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeEngagement?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeGrowth?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeTopPosts?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  trackClicks?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  trackVisits?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  trackDemographics?: boolean;
}
