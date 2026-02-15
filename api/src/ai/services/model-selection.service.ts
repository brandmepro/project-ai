import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from '../entities/ai-model.entity';
import { AITaskCategory } from '../entities/ai-task-category.entity';

export interface ModelSelectionCriteria {
  taskCategory?: string;
  requiredCapabilities?: string[];
  preferredCapabilities?: string[];
  maxCostPer1mInput?: number;
  maxCostPer1mOutput?: number;
  minContextWindow?: number;
  maxLatencyMs?: number;
  prioritizeSpeed?: boolean;
  prioritizeCost?: boolean;
  prioritizeQuality?: boolean;
  requiresVision?: boolean;
  requiresImageGen?: boolean;
  requiresWebSearch?: boolean;
}

export interface ModelRecommendation {
  model: AIModel;
  score: number;
  reason: string;
  alternatives?: AIModel[];
}

@Injectable()
export class ModelSelectionService {
  private readonly logger = new Logger(ModelSelectionService.name);

  constructor(
    @InjectRepository(AIModel)
    private readonly aiModelRepository: Repository<AIModel>,
    @InjectRepository(AITaskCategory)
    private readonly taskCategoryRepository: Repository<AITaskCategory>,
  ) {}

  /**
   * Select best model based on task category and criteria
   */
  async selectModel(criteria: ModelSelectionCriteria): Promise<ModelRecommendation> {
    // Get task category if provided
    let taskCategory: AITaskCategory | null = null;
    if (criteria.taskCategory) {
      taskCategory = await this.taskCategoryRepository.findOne({
        where: { categoryKey: criteria.taskCategory, isActive: true },
      });
    }

    // Build query
    const queryBuilder = this.aiModelRepository
      .createQueryBuilder('model')
      .where('model.is_active = :isActive', { isActive: true });

    // Apply required capabilities
    const requiredCapabilities = criteria.requiredCapabilities || taskCategory?.requiredCapabilities || [];
    if (requiredCapabilities.length > 0) {
      queryBuilder.andWhere('model.capabilities && :requiredCaps', {
        requiredCaps: requiredCapabilities,
      });
    }

    // Apply vision requirement
    if (criteria.requiresVision) {
      queryBuilder.andWhere('model.supports_vision = :supportsVision', { supportsVision: true });
    }

    // Apply image generation requirement
    if (criteria.requiresImageGen) {
      queryBuilder.andWhere('model.supports_image_gen = :supportsImageGen', { supportsImageGen: true });
    }

    // Apply web search requirement
    if (criteria.requiresWebSearch) {
      queryBuilder.andWhere('model.supports_web_search = :supportsWebSearch', {
        supportsWebSearch: true,
      });
    }

    // Apply cost constraints
    if (criteria.maxCostPer1mInput) {
      queryBuilder.andWhere(
        '(model.cost_per_1m_input <= :maxInput OR model.cost_per_1m_input IS NULL)',
        { maxInput: criteria.maxCostPer1mInput },
      );
    }
    if (criteria.maxCostPer1mOutput) {
      queryBuilder.andWhere(
        '(model.cost_per_1m_output <= :maxOutput OR model.cost_per_1m_output IS NULL)',
        { maxOutput: criteria.maxCostPer1mOutput },
      );
    }

    // Apply context window requirement
    if (criteria.minContextWindow) {
      queryBuilder.andWhere('model.context_window >= :minContext', {
        minContext: criteria.minContextWindow,
      });
    }

    // Apply latency requirement
    if (criteria.maxLatencyMs) {
      queryBuilder.andWhere('(model.latency_ms <= :maxLatency OR model.latency_ms IS NULL)', {
        maxLatency: criteria.maxLatencyMs,
      });
    }

    // Order by priority
    if (criteria.prioritizeSpeed) {
      queryBuilder.orderBy('model.latency_ms', 'ASC', 'NULLS LAST');
      queryBuilder.addOrderBy('model.throughput_tps', 'DESC', 'NULLS LAST');
    } else if (criteria.prioritizeCost) {
      queryBuilder.orderBy('model.cost_per_1m_input', 'ASC', 'NULLS LAST');
      queryBuilder.addOrderBy('model.cost_per_1m_output', 'ASC', 'NULLS LAST');
    } else if (criteria.prioritizeQuality) {
      queryBuilder.orderBy('model.overall_quality_score', 'DESC', 'NULLS LAST');
      queryBuilder.addOrderBy('model.reliability_score', 'DESC', 'NULLS LAST');
    } else {
      // Default: prioritize recommended models and then by priority rank
      queryBuilder.orderBy('model.is_recommended', 'DESC');
      queryBuilder.addOrderBy('model.priority_rank', 'ASC');
    }

    // Get top models
    const models = await queryBuilder.limit(5).getMany();

    if (models.length === 0) {
      this.logger.error('No models found matching criteria', criteria);
      throw new Error('No suitable AI models available for this task');
    }

    // Score models
    const scoredModels = models.map((model) => ({
      model,
      score: this.calculateModelScore(model, criteria, taskCategory),
    }));

    // Sort by score
    scoredModels.sort((a, b) => b.score - a.score);

    const best = scoredModels[0];
    const alternatives = scoredModels.slice(1, 4).map((sm) => sm.model);

    const reason = this.generateRecommendationReason(best.model, criteria, taskCategory);

    this.logger.log(
      `Selected model: ${best.model.modelId} (score: ${best.score.toFixed(2)}) for ${criteria.taskCategory || 'custom task'}`,
    );

    return {
      model: best.model,
      score: best.score,
      reason,
      alternatives,
    };
  }

  /**
   * Get all AI models with optional filters
   */
  async getAllModels(filters?: {
    activeOnly?: boolean;
    provider?: string;
    type?: string;
  }): Promise<AIModel[]> {
    const where: any = {};
    
    if (filters?.activeOnly) {
      where.isActive = true;
    }
    
    if (filters?.provider) {
      where.provider = filters.provider;
    }
    
    return this.aiModelRepository.find({
      where,
      order: {
        priorityRank: 'DESC',
        modelName: 'ASC',
      },
    });
  }

  /**
   * Get model by internal database ID
   */
  async getModelById(id: number): Promise<AIModel | null> {
    return this.aiModelRepository.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Get model by external model ID (e.g., "anthropic/claude-sonnet-4")
   */
  async getModelByModelId(modelId: string): Promise<AIModel | null> {
    return this.aiModelRepository.findOne({
      where: { modelId, isActive: true },
    });
  }

  /**
   * Get all models for a capability
   */
  async getModelsByCapability(capability: string): Promise<AIModel[]> {
    return this.aiModelRepository
      .createQueryBuilder('model')
      .where('model.is_active = :isActive', { isActive: true })
      .andWhere(':capability = ANY(model.capabilities)', { capability })
      .orderBy('model.priority_rank', 'ASC')
      .getMany();
  }

  /**
   * Get recommended models
   */
  async getRecommendedModels(): Promise<AIModel[]> {
    return this.aiModelRepository.find({
      where: { isActive: true, isRecommended: true },
      order: { priorityRank: 'ASC' },
    });
  }

  /**
   * Calculate model score based on criteria
   */
  private calculateModelScore(
    model: AIModel,
    criteria: ModelSelectionCriteria,
    taskCategory: AITaskCategory | null,
  ): number {
    let score = 0;

    // Base score from priority rank (lower is better)
    score += 100 - model.priorityRank;

    // Boost recommended models
    if (model.isRecommended) {
      score += 20;
    }

    // Preferred capabilities from task category
    const preferredCapabilities = criteria.preferredCapabilities || taskCategory?.preferredCapabilities || [];
    const matchedPreferred = preferredCapabilities.filter((cap) => model.capabilities.includes(cap));
    score += matchedPreferred.length * 10;

    // Speed priority
    if (criteria.prioritizeSpeed && model.latencyMs) {
      score += Math.max(0, 50 - model.latencyMs / 100);
    }
    if (criteria.prioritizeSpeed && model.throughputTps) {
      score += Math.min(30, model.throughputTps / 10);
    }

    // Cost priority
    if (criteria.prioritizeCost) {
      if (model.costBucket === 'low') score += 30;
      else if (model.costBucket === 'medium') score += 15;
    }

    // Quality priority
    if (criteria.prioritizeQuality) {
      if (model.overallQualityScore) {
        score += model.overallQualityScore * 20;
      }
      if (model.reliabilityScore) {
        score += model.reliabilityScore * 15;
      }
    }

    // Use case match
    if (criteria.taskCategory && model.useCases.includes(criteria.taskCategory)) {
      score += 25;
    }

    return score;
  }

  /**
   * Generate reason for recommendation
   */
  private generateRecommendationReason(
    model: AIModel,
    criteria: ModelSelectionCriteria,
    taskCategory: AITaskCategory | null,
  ): string {
    const reasons: string[] = [];

    if (criteria.prioritizeSpeed) {
      reasons.push(`optimized for speed (${model.latencyMs}ms latency)`);
    }
    if (criteria.prioritizeCost) {
      reasons.push(`cost-effective (${model.costBucket} cost bucket)`);
    }
    if (criteria.prioritizeQuality) {
      reasons.push('highest quality for this task');
    }
    if (criteria.requiresVision) {
      reasons.push('supports vision/multimodal input');
    }
    if (criteria.requiresImageGen) {
      reasons.push('can generate images');
    }
    if (model.isRecommended) {
      reasons.push('recommended for production use');
    }
    if (taskCategory) {
      reasons.push(`optimized for ${taskCategory.categoryName}`);
    }

    return reasons.length > 0
      ? `${model.modelName}: ${reasons.join(', ')}`
      : `${model.modelName}: ${model.description || 'suitable for this task'}`;
  }

  /**
   * Get cost estimate for a task
   */
  async estimateCost(
    modelId: number,
    inputTokens: number,
    outputTokens: number,
  ): Promise<{ inputCost: number; outputCost: number; totalCost: number }> {
    const model = await this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const inputCost = (model.costPer1mInput || 0) * (inputTokens / 1_000_000);
    const outputCost = (model.costPer1mOutput || 0) * (outputTokens / 1_000_000);
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
    };
  }
}
