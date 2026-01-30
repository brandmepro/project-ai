import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Platform, ContentStatus } from '../../common/enums';

export class QueryContentDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search in caption' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: Platform,
    isArray: true,
    description: 'Filter by platforms',
  })
  @IsEnum(Platform, { each: true })
  @IsArray()
  @IsOptional()
  platforms?: Platform[];

  @ApiPropertyOptional({
    enum: ContentStatus,
    isArray: true,
    description: 'Filter by status',
  })
  @IsEnum(ContentStatus, { each: true })
  @IsArray()
  @IsOptional()
  statuses?: ContentStatus[];

  @ApiPropertyOptional({ description: 'Filter by date from (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'scheduledFor', 'publishedAt'],
    description: 'Sort by field',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'scheduledFor' | 'publishedAt' = 'createdAt';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
