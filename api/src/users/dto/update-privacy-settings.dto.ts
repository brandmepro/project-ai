import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum ProfileVisibility {
  PUBLIC = 'public',
  TEAM = 'team',
  PRIVATE = 'private',
}

export enum ShareAnalytics {
  PUBLIC = 'public',
  TEAM = 'team',
  PRIVATE = 'private',
}

export class UpdatePrivacySettingsDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  storeDrafts?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  cacheContent?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  analyticsCollection?: boolean;

  @ApiProperty({ enum: ProfileVisibility, required: false })
  @IsEnum(ProfileVisibility)
  @IsOptional()
  profileVisibility?: ProfileVisibility;

  @ApiProperty({ enum: ShareAnalytics, required: false })
  @IsEnum(ShareAnalytics)
  @IsOptional()
  shareAnalytics?: ShareAnalytics;
}
