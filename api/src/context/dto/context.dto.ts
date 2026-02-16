import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { MemoryCategory, MemorySource } from '../entities/ai-memory.entity';
import { TemplateCategory } from '../entities/context-template.entity';

// Business Profile DTOs
export class BrandVoiceDto {
  @IsString()
  tone: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsOptional()
  avoidWords?: string[];

  @IsString()
  @IsOptional()
  styleGuidelines?: string;
}

export class ProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsBoolean()
  @IsOptional()
  highlight?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
}

export class BrandAssetsDto {
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsArray()
  @IsOptional()
  fonts?: string[];

  @IsString()
  @IsOptional()
  imageStyle?: string;
}

export class CreateBusinessProfileDto {
  @IsString()
  businessName: string;

  @IsString()
  businessType: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  elevatorPitch?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products?: ProductDto[];

  @IsArray()
  @IsOptional()
  servicesOffered?: string[];

  @IsArray()
  @IsOptional()
  uniqueSellingPoints?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandVoiceDto)
  brandVoice?: BrandVoiceDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandAssetsDto)
  brandAssets?: BrandAssetsDto;

  @IsArray()
  @IsOptional()
  brandValues?: string[];

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsOptional()
  audienceAgeRange?: string;

  @IsArray()
  @IsOptional()
  audienceInterests?: string[];

  @IsString()
  @IsOptional()
  audienceLocation?: string;

  @IsArray()
  @IsOptional()
  businessGoals?: string[];

  @IsArray()
  @IsOptional()
  successMetrics?: string[];

  @IsString()
  @IsOptional()
  marketingObjectives?: string;

  @IsArray()
  @IsOptional()
  competitors?: string[];

  @IsString()
  @IsOptional()
  marketPosition?: string;

  @IsArray()
  @IsOptional()
  contentThemes?: string[];

  @IsArray()
  @IsOptional()
  contentAvoidTopics?: string[];

  @IsString()
  @IsOptional()
  contentFrequencyPreference?: string;

  @IsString()
  @IsOptional()
  additionalContext?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateBusinessProfileDto extends CreateBusinessProfileDto {}

// Memory DTOs
export class CreateMemoryDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsEnum(MemoryCategory)
  @IsOptional()
  category?: MemoryCategory;

  @IsEnum(MemorySource)
  @IsOptional()
  source?: MemorySource;

  @IsNumber()
  @IsOptional()
  importance?: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  relatedPlatform?: string;

  @IsString()
  @IsOptional()
  relatedTaskType?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}

export class SearchMemoriesDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsEnum(MemoryCategory)
  @IsOptional()
  category?: MemoryCategory;

  @IsString()
  @IsOptional()
  relatedPlatform?: string;

  @IsString()
  @IsOptional()
  relatedTaskType?: string;

  @IsNumber()
  @IsOptional()
  minImportance?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}

// Template DTOs
export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsString()
  content: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;

  @IsArray()
  @IsOptional()
  applicablePlatforms?: string[];

  @IsArray()
  @IsOptional()
  applicableTaskTypes?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class UpdateTemplateDto extends CreateTemplateDto {}

// Context Preview DTO
export class ContextPreviewDto {
  @IsEnum(['generate_ideas', 'caption_generation', 'hook_generation', 'hashtag_generation', 'enhancement'])
  taskType: 'generate_ideas' | 'caption_generation' | 'hook_generation' | 'hashtag_generation' | 'enhancement';

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  additionalContext?: string;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;
}
