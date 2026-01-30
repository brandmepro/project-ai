import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Tone, Language } from '../../common/enums';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: Language, description: 'Default language' })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({ enum: Tone, description: 'Default tone' })
  @IsEnum(Tone)
  @IsOptional()
  tone?: Tone;

  @ApiPropertyOptional({ description: 'Auto-save drafts' })
  @IsBoolean()
  @IsOptional()
  autoSave?: boolean;

  @ApiPropertyOptional({ description: 'Dark mode enabled' })
  @IsBoolean()
  @IsOptional()
  darkMode?: boolean;
}
