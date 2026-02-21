import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  IsPositive,
  IsObject,
} from 'class-validator';
import {
  Platform,
  ContentStatus,
  BusinessType,
  ContentGoal,
  Tone,
  Language,
  VisualStyle,
} from '../../common/enums';

export class CreateContentDto {
  @ApiProperty({ description: 'Content caption/text' })
  @IsString()
  caption: string;

  @ApiProperty({ description: 'Hashtags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  hashtags: string[];

  @ApiProperty({ enum: Platform, description: 'Social media platform' })
  @IsEnum(Platform)
  platform: Platform;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
    description: 'Content status',
  })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @ApiPropertyOptional({ enum: BusinessType, description: 'Business type' })
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @ApiPropertyOptional({
    enum: ContentGoal,
    description: 'Content marketing goal',
  })
  @IsEnum(ContentGoal)
  @IsOptional()
  contentGoal?: ContentGoal;

  @ApiPropertyOptional({ enum: Tone, description: 'Content tone' })
  @IsEnum(Tone)
  @IsOptional()
  tone?: Tone;

  @ApiPropertyOptional({ enum: Language, description: 'Content language' })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({
    enum: VisualStyle,
    description: 'Visual style preference',
  })
  @IsEnum(VisualStyle)
  @IsOptional()
  visualStyle?: VisualStyle;

  @ApiPropertyOptional({
    description: 'Scheduled date and time (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  scheduledFor?: Date;

  @ApiPropertyOptional({
    description: 'Media URLs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @ApiPropertyOptional({
    description: 'AI tags',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  aiTags?: string[];

  @ApiPropertyOptional({
    description: 'AI idea ID reference',
  })
  @IsString()
  @IsOptional()
  aiIdeaId?: string;

  @ApiPropertyOptional({
    description: 'Organization ID (for team accounts)',
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  organizationId?: number;

  @ApiPropertyOptional({
    description: 'Engagement metrics',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
  };
}
