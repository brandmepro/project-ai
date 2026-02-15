import { IsEnum, IsString, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { FeedbackType, AITaskCategory } from '../types/ai-types';

export class FeedbackDto {
  @IsInt()
  aiLogId: number;

  @IsInt()
  modelId: number;

  @IsEnum(AITaskCategory)
  category: AITaskCategory;

  @IsEnum(FeedbackType)
  feedbackType: FeedbackType;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  qualityRating?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
