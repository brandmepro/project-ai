import { Injectable, Logger } from '@nestjs/common';
import { ModelSelectionService, ModelSelectionCriteria } from './model-selection.service';
import { AIModel } from '../entities/ai-model.entity';

export interface TaskAnalysis {
  complexity: 'low' | 'medium' | 'high';
  requiresVision: boolean;
  requiresReasoning: boolean;
  estimatedTokens: number;
  recommendedModelId: string;
  reason: string;
  model?: AIModel;
}

@Injectable()
export class ModelOptimizerService {
  private readonly logger = new Logger(ModelOptimizerService.name);

  constructor(private readonly modelSelectionService: ModelSelectionService) {}

  /**
   * Analyze task and recommend optimal model from database
   */
  async analyzeTask(
    feature: string,
    hasMedia: boolean,
    contextLength: number,
    requiresCreativity: boolean = false,
  ): Promise<TaskAnalysis> {
    let complexity: 'low' | 'medium' | 'high' = 'low';
    let requiresVision = hasMedia;
    let requiresReasoning = false;
    let estimatedTokens = 300;
    let taskCategory = feature;
    let prioritizeSpeed = false;
    let prioritizeCost = false;
    let prioritizeQuality = false;

    // Analyze based on feature type
    switch (feature) {
      case 'generate_ideas':
        complexity = 'high';
        requiresReasoning = true;
        estimatedTokens = 1500;
        taskCategory = 'content_ideas';
        prioritizeQuality = true;
        break;

      case 'generate_caption':
        if (hasMedia) {
          complexity = 'medium';
          requiresVision = true;
          estimatedTokens = 500;
          taskCategory = 'captions_with_media';
        } else if (contextLength > 500 || requiresCreativity) {
          complexity = 'medium';
          estimatedTokens = 500;
          taskCategory = 'captions';
        } else {
          complexity = 'low';
          estimatedTokens = 300;
          taskCategory = 'captions';
          prioritizeCost = true;
        }
        break;

      case 'generate_hooks':
        complexity = 'low';
        estimatedTokens = 200;
        taskCategory = 'hooks';
        prioritizeSpeed = true;
        break;

      case 'generate_hashtags':
        complexity = 'low';
        estimatedTokens = 150;
        taskCategory = 'hashtags';
        prioritizeSpeed = true;
        prioritizeCost = true;
        break;

      case 'content_enhancement':
        complexity = 'medium';
        requiresReasoning = true;
        estimatedTokens = 600;
        prioritizeQuality = true;
        break;

      case 'media_analysis':
        complexity = 'medium';
        requiresVision = true;
        estimatedTokens = 700;
        break;

      case 'image_generation':
        complexity = 'medium';
        estimatedTokens = 0;
        taskCategory = 'image_generation';
        break;

      default:
        this.logger.warn(`Unknown feature: ${feature}, using default task category`);
    }

    // Adjust for context length
    if (contextLength > 1000) {
      estimatedTokens += Math.floor(contextLength / 10);
    }

    // Build selection criteria
    const criteria: ModelSelectionCriteria = {
      taskCategory,
      requiresVision,
      minContextWindow: Math.max(contextLength, 8000),
      prioritizeSpeed,
      prioritizeCost,
      prioritizeQuality,
    };

    // Select model from database
    try {
      const recommendation = await this.modelSelectionService.selectModel(criteria);

      const analysis: TaskAnalysis = {
        complexity,
        requiresVision,
        requiresReasoning,
        estimatedTokens,
        recommendedModelId: recommendation.model.modelId,
        reason: recommendation.reason,
        model: recommendation.model,
      };

      this.logger.debug(
        `Task analysis: feature=${feature}, model=${recommendation.model.modelId}, complexity=${complexity}, tokens~${estimatedTokens}`,
      );

      return analysis;
    } catch (error) {
      this.logger.error(`Failed to select model for feature ${feature}`, error.stack);
      
      // Fallback to default model IDs
      const fallbackModelId = this.getFallbackModelId(feature, hasMedia);
      
      return {
        complexity,
        requiresVision,
        requiresReasoning,
        estimatedTokens,
        recommendedModelId: fallbackModelId,
        reason: 'Fallback model (database query failed)',
      };
    }
  }

  /**
   * Get fallback model ID when database query fails
   */
  private getFallbackModelId(feature: string, hasMedia: boolean): string {
    if (hasMedia) {
      return 'openai:gpt-4o'; // Vision capable
    }
    
    switch (feature) {
      case 'generate_ideas':
        return 'openai:gpt-4o';
      case 'image_generation':
        return 'bfl:flux-pro-1.1';
      default:
        return 'openai:gpt-4o-mini'; // Fast and cheap for most tasks
    }
  }

  /**
   * Get optimal temperature based on task type
   */
  getOptimalTemperature(feature: string, creativity: 'low' | 'medium' | 'high' = 'medium'): number {
    const baseTemperatures = {
      generate_ideas: 0.9,
      generate_caption: 0.8,
      generate_hooks: 0.95,
      generate_hashtags: 0.7,
      content_enhancement: 0.7,
      media_analysis: 0.6,
    };

    let temp = baseTemperatures[feature] || 0.7;

    // Adjust based on creativity requirement
    if (creativity === 'high') {
      temp = Math.min(temp + 0.1, 1.0);
    } else if (creativity === 'low') {
      temp = Math.max(temp - 0.1, 0.1);
    }

    return temp;
  }

  /**
   * Get optimal max tokens based on task
   */
  getOptimalMaxTokens(feature: string, complexity: 'low' | 'medium' | 'high'): number {
    const baseTokens = {
      generate_ideas: 2000,
      generate_caption: 500,
      generate_hooks: 300,
      generate_hashtags: 200,
      content_enhancement: 800,
      media_analysis: 1000,
    };

    let tokens = baseTokens[feature] || 500;

    // Adjust for complexity
    if (complexity === 'high') {
      tokens = Math.floor(tokens * 1.5);
    } else if (complexity === 'low') {
      tokens = Math.floor(tokens * 0.7);
    }

    return tokens;
  }
}
