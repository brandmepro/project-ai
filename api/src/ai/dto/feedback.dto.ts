import { IsEnum, IsString, IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { FeedbackType, AITaskCategory } from '@businesspro/ai';

export class FeedbackDto {
  @IsUUID()
  aiLogId: string;

  @IsString()
  modelId: string;

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
