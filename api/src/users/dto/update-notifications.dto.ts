import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationsDto {
  @ApiPropertyOptional({ description: 'Email notifications enabled' })
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications enabled' })
  @IsBoolean()
  @IsOptional()
  push?: boolean;

  @ApiPropertyOptional({ description: 'Content ready notifications' })
  @IsBoolean()
  @IsOptional()
  contentReady?: boolean;

  @ApiPropertyOptional({ description: 'Weekly report notifications' })
  @IsBoolean()
  @IsOptional()
  weeklyReport?: boolean;

  @ApiPropertyOptional({ description: 'AI suggestions notifications' })
  @IsBoolean()
  @IsOptional()
  aiSuggestions?: boolean;
}
