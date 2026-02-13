import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export enum ImageQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ORIGINAL = 'original',
}

export class UpdateAdvancedSettingsDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  debugMode?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  apiLogs?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  betaFeatures?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  aiModelTesting?: boolean;

  @ApiProperty({ enum: ImageQuality, required: false })
  @IsEnum(ImageQuality)
  @IsOptional()
  imageQuality?: ImageQuality;

  @ApiProperty({ required: false, description: 'Cache duration in days' })
  @IsNumber()
  @IsOptional()
  cacheDuration?: number;
}
