import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AIModel } from '../../ai/entities/ai-model.entity';
import {
  VercelAIGatewayResponse,
  VercelAIModel,
  ModelPricing,
} from '../types/vercel-models.types';

@Injectable()
export class ModelSyncService {
  private readonly logger = new Logger(ModelSyncService.name);
  private readonly aiGatewayBaseUrl: string;

  constructor(
    @InjectRepository(AIModel)
    private readonly aiModelRepository: Repository<AIModel>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiGatewayBaseUrl =
      this.configService.get<string>('AI_GATEWAY_BASE_URL') ||
      'https://ai-gateway.vercel.sh/v1';
  }

  /**
   * Fetch all AI models from Vercel AI Gateway
   */
  async fetchModelsFromGateway(): Promise<VercelAIModel[]> {
    try {
      const url = `${this.aiGatewayBaseUrl}/models`;
      this.logger.log(`Fetching models from: ${url}`);

      const { data } = await firstValueFrom(
        this.httpService.get<VercelAIGatewayResponse>(url, {
          timeout: 30000,
          headers: {
            'Accept': 'application/json',
          },
        }),
      );

      if (data?.object === 'list' && Array.isArray(data?.data)) {
        this.logger.log(`Successfully fetched ${data.data.length} models from AI Gateway`);
        return data.data;
      }

      this.logger.warn('Unexpected response format from AI Gateway');
      return [];
    } catch (error) {
      this.logger.error('Failed to fetch models from AI Gateway', (error as Error)?.stack);
      throw error;
    }
  }

  /**
   * Transform Vercel AI model to our AIModel entity
   */
  private transformVercelModelToEntity(vercelModel: VercelAIModel): Partial<AIModel> {
    const pricing = vercelModel.pricing || {};
    
    // Extract provider from model ID (format: "provider/model-name")
    const provider = vercelModel.id?.split('/')[0] || vercelModel.owned_by || 'unknown';
    
    // Determine capabilities and features from tags and type
    const tags = vercelModel.tags || [];
    const supportsToolUse = tags.includes('tool-use');
    const supportsVision = tags.includes('vision') || tags.includes('file-input');
    const supportsReasoning = tags.includes('reasoning');
    const supportsImageGen = tags.includes('image-generation') || vercelModel.type === 'image';
    const supportsWebSearch = typeof pricing.web_search === 'string' || typeof pricing.web_search === 'number';

    // Parse costs - handle both flat rates and tiered pricing
    const inputCost = this.parseCostValue(pricing.input);
    const outputCost = this.parseCostValue(pricing.output);
    const cacheReadCost = this.parseCostValue(pricing.input_cache_read);
    const cacheWriteCost = this.parseCostValue(pricing.input_cache_write);
    const imageCost = this.parseCostValue(pricing.image);
    const webSearchCost = this.parseCostValue(pricing.web_search);

    // Determine cost bucket based on output cost
    let costBucket = 'unknown';
    if (outputCost !== null) {
      if (outputCost < 0.000001) costBucket = 'free';
      else if (outputCost < 0.000005) costBucket = 'ultra-low';
      else if (outputCost < 0.00002) costBucket = 'low';
      else if (outputCost < 0.0001) costBucket = 'medium';
      else if (outputCost < 0.001) costBucket = 'high';
      else costBucket = 'premium';
    } else if (imageCost !== null) {
      if (imageCost < 0.02) costBucket = 'low';
      else if (imageCost < 0.05) costBucket = 'medium';
      else costBucket = 'high';
    }

    // Build capabilities array
    const capabilities: string[] = [];
    if (vercelModel.type === 'language') capabilities.push('text-generation');
    if (vercelModel.type === 'embedding') capabilities.push('embeddings');
    if (vercelModel.type === 'image') capabilities.push('image-generation');
    if (supportsToolUse) capabilities.push('function-calling');
    if (supportsVision) capabilities.push('vision');
    if (supportsReasoning) capabilities.push('reasoning');
    if (tags.includes('implicit-caching')) capabilities.push('caching');

    return {
      modelId: vercelModel.id,
      modelName: vercelModel.name || vercelModel.id,
      provider: provider,
      version: null, // Vercel doesn't provide version info separately
      capabilities,
      supportsStreaming: vercelModel.type === 'language', // Language models typically support streaming
      supportsJsonMode: vercelModel.type === 'language',
      supportsFunctionCalling: supportsToolUse,
      supportsVision,
      supportsImageGen,
      supportsVideoGen: false, // Not clearly indicated in API
      supportsWebSearch,
      maxTokens: vercelModel.max_tokens || null,
      contextWindow: vercelModel.context_window || null,
      availableProviders: [provider],
      latencyMs: null, // Not provided by API
      throughputTps: null, // Not provided by API
      costBucket,
      costPer1mInput: inputCost,
      costPer1mOutput: outputCost,
      cacheReadCostPer1m: cacheReadCost,
      cacheWriteCostPer1m: cacheWriteCost,
      imageGenCost: imageCost,
      videoGenCost: null,
      webSearchCost,
      overallQualityScore: null, // We'll calculate this based on usage data
      reliabilityScore: null,
      isActive: true,
      isRecommended: false, // Will be determined by our recommendation logic
      priorityRank: 0,
      description: vercelModel.description || null,
      useCases: tags.filter(tag => !['tool-use', 'vision', 'file-input', 'reasoning', 'image-generation', 'implicit-caching'].includes(tag)),
      limitations: null,
      metadata: {
        object: vercelModel.object,
        created: vercelModel.created,
        released: vercelModel.released,
        owned_by: vercelModel.owned_by,
        type: vercelModel.type,
        tags: vercelModel.tags,
        pricing: vercelModel.pricing,
        lastSyncedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Parse cost value from pricing object (handles flat rate or tiered pricing)
   */
  private parseCostValue(value: string | number | Array<{ cost: string; min: number; max?: number }> | undefined): number | null {
    if (value === undefined || value === null) return null;
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    
    if (typeof value === 'number') {
      return value;
    }
    
    // For tiered pricing, take the first tier's cost as base cost
    if (Array.isArray(value) && value.length > 0) {
      const firstTierCost = parseFloat(value[0].cost);
      return isNaN(firstTierCost) ? null : firstTierCost;
    }
    
    return null;
  }

  /**
   * Sync models from AI Gateway to database
   */
  async syncModels(): Promise<{
    total: number;
    created: number;
    updated: number;
    failed: number;
  }> {
    this.logger.log('Starting AI models synchronization...');
    
    const stats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
    };

    try {
      // Fetch models from AI Gateway
      const vercelModels = await this.fetchModelsFromGateway();
      stats.total = vercelModels.length;

      if (vercelModels.length === 0) {
        this.logger.warn('No models fetched from AI Gateway');
        return stats;
      }

      // Process each model
      for (const vercelModel of vercelModels) {
        try {
          await this.upsertModel(vercelModel, stats);
        } catch (error) {
          this.logger.error(`Failed to sync model ${vercelModel.id}`, (error as Error)?.stack);
          stats.failed++;
        }
      }

      // Mark models that are no longer in the API as inactive
      await this.deactivateRemovedModels(vercelModels.map(m => m.id));

      this.logger.log(
        `AI models sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`,
      );

      return stats;
    } catch (error) {
      this.logger.error('AI models synchronization failed', (error as Error)?.stack);
      throw error;
    }
  }

  /**
   * Insert or update a single model
   */
  private async upsertModel(
    vercelModel: VercelAIModel,
    stats: { created: number; updated: number },
  ): Promise<void> {
    const existingModel = await this.aiModelRepository.findOne({
      where: { modelId: vercelModel.id },
    });

    const modelData = this.transformVercelModelToEntity(vercelModel);

    if (existingModel) {
      // Update existing model
      await this.aiModelRepository.update(
        { modelId: vercelModel.id },
        {
          ...modelData,
          // Preserve certain fields that shouldn't be overwritten
          isRecommended: existingModel.isRecommended,
          priorityRank: existingModel.priorityRank,
          overallQualityScore: existingModel.overallQualityScore,
          reliabilityScore: existingModel.reliabilityScore,
        },
      );
      stats.updated++;
      this.logger.debug(`Updated model: ${vercelModel.id}`);
    } else {
      // Create new model
      const newModel = this.aiModelRepository.create(modelData);
      await this.aiModelRepository.save(newModel);
      stats.created++;
      this.logger.debug(`Created model: ${vercelModel.id}`);
    }
  }

  /**
   * Deactivate models that are no longer in the API response
   */
  private async deactivateRemovedModels(activeModelIds: string[]): Promise<void> {
    try {
      const result = await this.aiModelRepository
        .createQueryBuilder()
        .update(AIModel)
        .set({ isActive: false })
        .where('model_id NOT IN (:...activeModelIds)', { activeModelIds })
        .andWhere('is_active = :isActive', { isActive: true })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Deactivated ${result.affected} models that are no longer available`);
      }
    } catch (error) {
      this.logger.error('Failed to deactivate removed models', (error as Error)?.stack);
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalModels: number;
    activeModels: number;
    inactiveModels: number;
    lastSyncDate: Date | null;
  }> {
    const [totalModels, activeModels] = await Promise.all([
      this.aiModelRepository.count(),
      this.aiModelRepository.count({ where: { isActive: true } }),
    ]);

    // Get the most recent updatedAt date
    const lastSynced = await this.aiModelRepository
      .createQueryBuilder('model')
      .select('MAX(model.updatedAt)', 'lastSync')
      .getRawOne();

    return {
      totalModels,
      activeModels,
      inactiveModels: totalModels - activeModels,
      lastSyncDate: lastSynced?.lastSync || null,
    };
  }
}
