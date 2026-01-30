import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from '../entities/ai-model.entity';
import { AIUserPreference } from '../entities/ai-user-preference.entity';
import {
  AITaskCategory,
  AITaskPriority,
  AITaskComplexity,
  AITaskRequest,
  ModelSelectionResult,
  AIProvider,
  ModelCapability,
} from '../types/ai-types';

interface ModelScore {
  model: AIModel;
  score: number;
  reasons: string[];
}

@Injectable()
export class ModelSelectionService {
  constructor(
    @InjectRepository(AIModel)
    private aiModelRepository: Repository<AIModel>,
    @InjectRepository(AIUserPreference)
    private userPreferenceRepository: Repository<AIUserPreference>,
  ) {}

  /**
   * Intelligently select the best model for a task
   */
  async selectBestModel(
    userId: string,
    taskRequest: AITaskRequest,
  ): Promise<ModelSelectionResult> {
    const {
      category,
      priority = AITaskPriority.BALANCED,
      complexity = AITaskComplexity.MODERATE,
      userPreferenceWeight = 0.3,
    } = taskRequest;

    // Get all active models
    const availableModels = await this.aiModelRepository.find({
      where: { isActive: true },
    });

    if (availableModels.length === 0) {
      throw new Error('No active AI models available');
    }

    // Score each model
    const scoredModels: ModelScore[] = [];

    for (const model of availableModels) {
      const score = await this.calculateModelScore(
        model,
        category,
        priority,
        complexity,
        userId,
        userPreferenceWeight,
      );

      scoredModels.push(score);
    }

    // Sort by score (descending)
    scoredModels.sort((a, b) => b.score - a.score);

    const bestModel = scoredModels[0];

    if (!bestModel) {
      throw new Error('Could not select a suitable model');
    }

    return {
      modelId: bestModel.model.modelId,
      modelName: bestModel.model.modelName,
      provider: bestModel.model.provider as AIProvider,
      reason: bestModel.reasons.join(', '),
      confidence: Math.min(bestModel.score / 100, 1),
      estimatedCost: bestModel.model.costBucket as any,
      estimatedSpeed: this.getSpeedCategory(bestModel.model.averageSpeedMs),
      capabilities: bestModel.model.capabilities as ModelCapability[],
    };
  }

  /**
   * Calculate comprehensive score for a model
   */
  private async calculateModelScore(
    model: AIModel,
    category: AITaskCategory,
    priority: AITaskPriority,
    complexity: AITaskComplexity,
    userId: string,
    userPreferenceWeight: number,
  ): Promise<ModelScore> {
    let totalScore = 0;
    const reasons: string[] = [];

    // Base score from model quality and reliability
    const baseScore = this.calculateBaseScore(model);
    totalScore += baseScore * 20; // Max 20 points
    if (baseScore > 0.8) reasons.push('High quality model');

    // Task category suitability
    const categorySuitability = this.calculateCategorySuitability(model, category);
    totalScore += categorySuitability * 30; // Max 30 points
    if (categorySuitability > 0.7) reasons.push('Well-suited for this task');

    // Priority alignment (speed vs quality)
    const priorityScore = this.calculatePriorityScore(model, priority);
    totalScore += priorityScore * 20; // Max 20 points
    if (priorityScore > 0.7) {
      if (priority === AITaskPriority.SPEED) reasons.push('Fast response time');
      if (priority === AITaskPriority.QUALITY) reasons.push('High-quality output');
    }

    // Complexity handling
    const complexityScore = this.calculateComplexityScore(model, complexity);
    totalScore += complexityScore * 15; // Max 15 points

    // User preference (if available)
    const userPrefScore = await this.getUserPreferenceScore(userId, model.id, category);
    totalScore += userPrefScore * userPreferenceWeight * 15; // Max 15 points (weighted)
    if (userPrefScore > 0.7) reasons.push('You liked this model before');

    // Boost for recommended models
    if (model.isRecommended) {
      totalScore += 5;
      reasons.push('Recommended by Business Pro');
    }

    // Priority rank bonus
    totalScore += model.priorityRank * 0.5;

    return {
      model,
      score: totalScore,
      reasons,
    };
  }

  /**
   * Base score from model's overall quality and reliability
   */
  private calculateBaseScore(model: AIModel): number {
    const quality = model.overallQualityScore || 0.7;
    const reliability = model.reliabilityScore || 0.8;
    return (quality / 5 + reliability) / 2; // Normalize to 0-1
  }

  /**
   * Calculate how suitable the model is for the task category
   */
  private calculateCategorySuitability(
    model: AIModel,
    category: AITaskCategory,
  ): number {
    const categoryMap: Record<string, string[]> = {
      [AITaskCategory.CONTENT_CAPTION]: [ModelCapability.TEXT_GENERATION],
      [AITaskCategory.CONTENT_HOOKS]: [ModelCapability.TEXT_GENERATION],
      [AITaskCategory.CONTENT_HASHTAGS]: [ModelCapability.TEXT_GENERATION],
      [AITaskCategory.CONTENT_IDEAS]: [ModelCapability.TEXT_GENERATION, ModelCapability.TEXT_REASONING],
      [AITaskCategory.CONTENT_SCRIPT]: [ModelCapability.TEXT_GENERATION, ModelCapability.TEXT_REASONING],
      [AITaskCategory.IMAGE_PHOTO]: [ModelCapability.IMAGE_GENERATION],
      [AITaskCategory.IMAGE_ILLUSTRATION]: [ModelCapability.IMAGE_GENERATION],
      [AITaskCategory.IMAGE_LOGO]: [ModelCapability.IMAGE_GENERATION],
      [AITaskCategory.IMAGE_SOCIAL]: [ModelCapability.IMAGE_GENERATION],
      [AITaskCategory.VIDEO_SHORT]: [ModelCapability.VIDEO_GENERATION],
      [AITaskCategory.VIDEO_LONG]: [ModelCapability.VIDEO_GENERATION],
      [AITaskCategory.VIDEO_ANIMATION]: [ModelCapability.VIDEO_GENERATION],
      [AITaskCategory.ANALYSIS_SENTIMENT]: [ModelCapability.TEXT_REASONING],
      [AITaskCategory.ANALYSIS_ENGAGEMENT]: [ModelCapability.TEXT_REASONING],
      [AITaskCategory.TRANSLATION]: [ModelCapability.TRANSLATION],
    };

    const requiredCapabilities = categoryMap[category] || [ModelCapability.TEXT_GENERATION];
    const modelCapabilities = model.capabilities || [];

    const hasAllRequired = requiredCapabilities.every(cap =>
      modelCapabilities.includes(cap),
    );

    if (!hasAllRequired) return 0.1;

    const matchCount = requiredCapabilities.filter(cap =>
      modelCapabilities.includes(cap),
    ).length;

    return matchCount / requiredCapabilities.length;
  }

  /**
   * Score based on priority (speed vs quality)
   */
  private calculatePriorityScore(model: AIModel, priority: AITaskPriority): number {
    const avgSpeed = model.averageSpeedMs || 3000;
    const costBucket = model.costBucket;

    if (priority === AITaskPriority.SPEED) {
      // Prefer fast, cheap models
      const speedScore = avgSpeed < 2000 ? 1 : avgSpeed < 5000 ? 0.7 : 0.4;
      const costScore = costBucket === 'low' ? 1 : costBucket === 'medium' ? 0.6 : 0.3;
      return (speedScore + costScore) / 2;
    }

    if (priority === AITaskPriority.QUALITY) {
      // Prefer high-quality models, cost less important
      const qualityScore = (model.overallQualityScore || 3.5) / 5;
      return qualityScore;
    }

    // BALANCED - middle ground
    const speedScore = avgSpeed < 3000 ? 1 : avgSpeed < 7000 ? 0.7 : 0.4;
    const qualityScore = (model.overallQualityScore || 3.5) / 5;
    const costScore = costBucket === 'medium' ? 1 : costBucket === 'low' ? 0.9 : 0.6;

    return (speedScore + qualityScore + costScore) / 3;
  }

  /**
   * Score based on complexity handling
   */
  private calculateComplexityScore(
    model: AIModel,
    complexity: AITaskComplexity,
  ): number {
    const contextWindow = model.contextWindow || 8000;
    const hasReasoning = model.capabilities?.includes('text_reasoning');

    if (complexity === AITaskComplexity.SIMPLE) {
      // Simple tasks - any model works, prefer cheaper
      return model.costBucket === 'low' ? 1 : 0.8;
    }

    if (complexity === AITaskComplexity.COMPLEX) {
      // Complex tasks - need powerful models
      if (!hasReasoning) return 0.3;
      if (contextWindow < 32000) return 0.5;
      return contextWindow > 100000 ? 1 : 0.8;
    }

    // MODERATE - middle ground
    return hasReasoning ? 0.9 : 0.7;
  }

  /**
   * Get user's preference score for this model + category
   */
  private async getUserPreferenceScore(
    userId: string,
    modelId: string,
    category: AITaskCategory,
  ): Promise<number> {
    try {
      const preference = await this.userPreferenceRepository.findOne({
        where: {
          userId,
          modelId,
          categoryKey: category,
        },
      });

      if (!preference) return 0.5; // Neutral if no history

      // Calculate score based on user's past interactions
      const likeRatio = preference.likes / (preference.likes + preference.dislikes + 1);
      const regenerateRatio = preference.regenerates / (preference.totalInteractions + 1);
      const qualityScore = (preference.averageQualityRating || 3) / 5;

      // High likes + low regenerates + high quality = high score
      const score =
        likeRatio * 0.4 + (1 - regenerateRatio) * 0.3 + qualityScore * 0.3;

      return Math.max(0, Math.min(1, score));
    } catch (error) {
      return 0.5; // Neutral on error
    }
  }

  /**
   * Categorize speed
   */
  private getSpeedCategory(avgSpeedMs: number | null): 'fast' | 'medium' | 'slow' {
    if (!avgSpeedMs) return 'medium';
    if (avgSpeedMs < 2000) return 'fast';
    if (avgSpeedMs < 5000) return 'medium';
    return 'slow';
  }

  /**
   * Get model by ID
   */
  async getModelById(modelId: string): Promise<AIModel | null> {
    return this.aiModelRepository.findOne({
      where: { modelId },
    });
  }

  /**
   * Get all active models for a category
   */
  async getModelsForCategory(category: AITaskCategory): Promise<AIModel[]> {
    const requiredCaps = this.getCategoryRequirements(category);

    const models = await this.aiModelRepository
      .createQueryBuilder('model')
      .where('model.is_active = :active', { active: true })
      .andWhere('model.capabilities @> :caps', { caps: requiredCaps })
      .orderBy('model.priority_rank', 'DESC')
      .addOrderBy('model.is_recommended', 'DESC')
      .getMany();

    return models;
  }

  /**
   * Get required capabilities for category
   */
  private getCategoryRequirements(category: AITaskCategory): string[] {
    const map: Record<string, string[]> = {
      [AITaskCategory.CONTENT_CAPTION]: [ModelCapability.TEXT_GENERATION],
      [AITaskCategory.CONTENT_IDEAS]: [ModelCapability.TEXT_GENERATION, ModelCapability.TEXT_REASONING],
      [AITaskCategory.IMAGE_SOCIAL]: [ModelCapability.IMAGE_GENERATION],
      [AITaskCategory.VIDEO_SHORT]: [ModelCapability.VIDEO_GENERATION],
    };

    return map[category] || [ModelCapability.TEXT_GENERATION];
  }
}
