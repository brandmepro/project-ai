import { IsEnum, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { AITaskCategory, AITaskPriority, AITaskComplexity } from '@businesspro/ai';

export class TaskRequestDto {
  @IsEnum(AITaskCategory)
  category: AITaskCategory;

  @IsEnum(AITaskPriority)
  @IsOptional()
  priority?: AITaskPriority;

  @IsEnum(AITaskComplexity)
  @IsOptional()
  complexity?: AITaskComplexity;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  userPreferenceWeight?: number;

  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsNumber()
  @IsOptional()
  maxTokens?: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;
}
