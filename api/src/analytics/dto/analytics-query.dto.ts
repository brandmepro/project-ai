import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum DateRange {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: DateRange,
    default: DateRange.THIRTY_DAYS,
    description: 'Date range for analytics',
  })
  @IsEnum(DateRange)
  @IsOptional()
  range?: DateRange = DateRange.THIRTY_DAYS;
}
