import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum AiPriority {
  SPEED = 'speed',
  BALANCED = 'balanced',
  QUALITY = 'quality',
}

export enum VisualStyle {
  CLEAN = 'clean',
  FESTIVE = 'festive',
  MODERN = 'modern',
  BOLD = 'bold',
}

export enum CaptionLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export enum EmojiUsage {
  NONE = 'none',
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
}

export class UpdateAiSettingsDto {
  @ApiProperty({ enum: AiPriority, required: false })
  @IsEnum(AiPriority)
  @IsOptional()
  aiPriority?: AiPriority;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  autoEnhance?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  smartHashtags?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  contentNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  experimentalFeatures?: boolean;

  @ApiProperty({ enum: VisualStyle, required: false })
  @IsEnum(VisualStyle)
  @IsOptional()
  visualStyle?: VisualStyle;

  @ApiProperty({ enum: CaptionLength, required: false })
  @IsEnum(CaptionLength)
  @IsOptional()
  captionLength?: CaptionLength;

  @ApiProperty({ enum: EmojiUsage, required: false })
  @IsEnum(EmojiUsage)
  @IsOptional()
  emojiUsage?: EmojiUsage;
}
