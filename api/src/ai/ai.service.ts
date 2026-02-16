import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AITaskRequest, AITaskCategory } from './types/ai-types';
import { AILog } from './entities/ai-log.entity';
import { ModelSelectionService } from './services/model-selection.service';
import { AIGatewayService } from './services/ai-gateway.service';
import { AIModel, AIFeature, AIResponseMetadata } from '@businesspro/ai';
import { AIPrompts } from './prompts/ai-prompts';
import { ModelOptimizerService } from './services/model-optimizer.service';
import { ContextBuilderService } from '../context/services/context-builder.service';

// DTOs
class GenerateIdeasRequest { businessType: string; platforms: string[]; contentGoal: string; tone: string; language: string; visualStyle: string; context?: string; imageUrl?: string; }
class GenerateCaptionRequest { businessType: string; platform: string; contentGoal: string; tone: string; language: string; context?: string; imageUrl?: string; videoUrl?: string; }
class GenerateHooksRequest { businessType: string; contentType: string; goal: string; language?: string; mediaUrl?: string; }
class GenerateHashtagsRequest { caption: string; businessType: string; platform: string; language: string; }

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(AILog)
    private aiLogRepository: Repository<AILog>,
    private modelSelectionService: ModelSelectionService,
    private aiGatewayService: AIGatewayService,
    private modelOptimizerService: ModelOptimizerService,
    private contextBuilderService: ContextBuilderService,
  ) {
    this.logger.log('AI Service initialized with Context Memory System');
  }

  /**
   * NEW: Generate with intelligent task-based model selection
   * TODO: Implement actual AI generation
   */
  async generateWithTask(userId: number, taskRequest: AITaskRequest) {
    // Temporary mock response
    return {
      data: { message: 'AI generation coming soon' },
      metadata: {
        modelSelection: {
          modelId: 'temp-model',
          modelName: 'Temporary Model',
          reason: 'AI service being set up'
        }
      },
    };
  }

  /**
   * Generate content ideas (5 storylines)
   */
  async generateIdeas(
    userId: number,
    request: GenerateIdeasRequest,
  ) {
    const gateway = this.aiGatewayService.getGateway();
    
    // Build AI context from memory system
    const contextResult = await this.contextBuilderService.buildContext({
      userId,
      taskType: 'generate_ideas',
      platform: request.platforms?.[0],
      additionalContext: request.context,
      maxTokens: 600, // Allow for task-specific context
    });

    const promptContext = {
      ...request,
      businessContext: contextResult.contextString,
    };
    
    const systemPrompt = AIPrompts.getIdeasSystemPrompt(promptContext);
    const prompt = AIPrompts.getIdeasPrompt(promptContext);

    const startTime = Date.now();
    
    // Dynamic model selection
    const taskAnalysis = await this.modelOptimizerService.analyzeTask(
      'generate_ideas',
      !!request.imageUrl,
      (request.context?.length || 0) + JSON.stringify(request).length + contextResult.tokensUsed,
      true,
    );

    this.logger.log(
      `Generating ideas for user ${userId}, business: ${request.businessType}, model: ${taskAnalysis.recommendedModelId}, context: ${contextResult.tokensUsed} tokens (tier: ${contextResult.metadata.tier}), reason: ${taskAnalysis.reason}`,
    );

    try {
      const { data, metadata} = await gateway.generateJSON<{ ideas: any[] }>(
        {
          model: taskAnalysis.recommendedModelId,
          feature: AIFeature.GENERATE_IDEAS,
          maxTokens: taskAnalysis.estimatedTokens,
          temperature: this.modelOptimizerService.getOptimalTemperature('generate_ideas', 'high'),
        },
        prompt,
        systemPrompt,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Ideas generated successfully in ${duration}ms, tokens: ${metadata.totalTokens}, cost: ${metadata.costBucket}`);

      // Log AI usage asynchronously
      setImmediate(() => {
        this.logAIUsage(userId, metadata, request, data).catch(err => 
          this.logger.error('Failed to log AI usage', err.stack)
        );
      });

      return {
        ideas: data.ideas,
        metadata: {
          model: metadata.model,
          costBucket: metadata.costBucket,
          totalTokens: metadata.totalTokens,
          durationMs: duration,
          generatedAt: new Date(),
          contextUsed: contextResult.tokensUsed,
          contextTier: contextResult.metadata.tier,
        },
      };
    } catch (error) {
      this.logger.error(`AI Ideas Generation failed for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate caption for content
   */
  async generateCaption(
    userId: number,
    request: GenerateCaptionRequest,
  ) {
    const gateway = this.aiGatewayService.getGateway();
    
    // Build AI context from memory system
    const contextResult = await this.contextBuilderService.buildContext({
      userId,
      taskType: 'caption_generation',
      platform: request.platform,
      additionalContext: request.context,
      maxTokens: 600,
    });

    const promptContext = {
      ...request,
      businessContext: contextResult.contextString,
    };
    
    const systemPrompt = AIPrompts.getCaptionSystemPrompt(promptContext);
    const prompt = AIPrompts.getCaptionPrompt(promptContext);

    // Build media URLs if provided
    const mediaUrls: { type: 'image' | 'video'; url: string }[] = [];
    if (request.imageUrl) {
      mediaUrls.push({ type: 'image', url: request.imageUrl });
    }
    if (request.videoUrl) {
      mediaUrls.push({ type: 'video', url: request.videoUrl });
    }

    const startTime = Date.now();

    // Dynamic model selection
    const taskAnalysis = await this.modelOptimizerService.analyzeTask(
      'generate_caption',
      mediaUrls.length > 0,
      (request.context?.length || 0) + JSON.stringify(request).length + contextResult.tokensUsed,
      request.tone === 'fun',
    );

    this.logger.log(
      `Generating caption for user ${userId}, business: ${request.businessType}, model: ${taskAnalysis.recommendedModelId}${mediaUrls.length > 0 ? ', with media' : ''}, context: ${contextResult.tokensUsed} tokens, reason: ${taskAnalysis.reason}`,
    );

    try {
      const { data, metadata } = await gateway.generateJSON<{
        caption: string;
        alternativeCaptions: string[];
      }>(
        {
          model: taskAnalysis.recommendedModelId,
          feature: AIFeature.GENERATE_CAPTION,
          maxTokens: taskAnalysis.estimatedTokens,
          temperature: this.modelOptimizerService.getOptimalTemperature('generate_caption', 'medium'),
        },
        prompt,
        systemPrompt,
        mediaUrls.length > 0 ? mediaUrls : undefined,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Caption generated in ${duration}ms, tokens: ${metadata.totalTokens}, cost: ${metadata.costBucket}`);

      // Log asynchronously
      setImmediate(() => {
        this.logAIUsage(userId, metadata, request, data).catch(err => 
          this.logger.error('Failed to log AI usage', err.stack)
        );
      });

      return {
        caption: data.caption,
        alternativeCaptions: data.alternativeCaptions,
        metadata: {
          model: metadata.model,
          costBucket: metadata.costBucket,
          totalTokens: metadata.totalTokens,
          durationMs: duration,
          contextUsed: contextResult.tokensUsed,
          contextTier: contextResult.metadata.tier,
        },
      };
    } catch (error) {
      this.logger.error(
        `AI Caption Generation failed for user ${userId}, attempted model: ${taskAnalysis.recommendedModelId}`,
        error.stack,
      );
      throw new Error(
        `AI generation failed using model ${taskAnalysis.recommendedModelId}: ${error.message}`,
      );
    }
  }

  /**
   * Generate hooks (attention grabbers)
   */
  async generateHooks(
    userId: number,
    request: GenerateHooksRequest,
  ) {
    const gateway = this.aiGatewayService.getGateway();
    
    // Build AI context
    const contextResult = await this.contextBuilderService.buildContext({
      userId,
      taskType: 'hook_generation',
      maxTokens: 400,
    });

    const promptContext = {
      ...request,
      businessContext: contextResult.contextString,
    };
    
    const systemPrompt = AIPrompts.getHooksSystemPrompt(promptContext);
    const prompt = AIPrompts.getHooksPrompt(promptContext);

    const startTime = Date.now();

    // Dynamic model selection
    const taskAnalysis = await this.modelOptimizerService.analyzeTask(
      'generate_hooks',
      !!request.mediaUrl,
      JSON.stringify(request).length + contextResult.tokensUsed,
      true,
    );

    this.logger.log(
      `Generating hooks for user ${userId}, business: ${request.businessType}, model: ${taskAnalysis.recommendedModelId}, context: ${contextResult.tokensUsed} tokens`,
    );

    try {
      const { data, metadata } = await gateway.generateJSON<{ hooks: string[] }>(
        {
          model: taskAnalysis.recommendedModelId,
          feature: AIFeature.GENERATE_HOOKS,
          maxTokens: taskAnalysis.estimatedTokens,
          temperature: this.modelOptimizerService.getOptimalTemperature('generate_hooks', 'high'),
        },
        prompt,
        systemPrompt,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Hooks generated in ${duration}ms, tokens: ${metadata.totalTokens}, cost: ${metadata.costBucket}`);

      setImmediate(() => {
        this.logAIUsage(userId, metadata, request, data).catch(err => 
          this.logger.error('Failed to log AI usage', err.stack)
        );
      });

      return {
        hooks: data.hooks,
        metadata: {
          model: metadata.model,
          costBucket: metadata.costBucket,
          totalTokens: metadata.totalTokens,
          durationMs: duration,
          contextUsed: contextResult.tokensUsed,
        },
      };
    } catch (error) {
      this.logger.error(`AI Hooks Generation failed for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate relevant hashtags
   */
  async generateHashtags(
    userId: number,
    request: GenerateHashtagsRequest,
  ) {
    const gateway = this.aiGatewayService.getGateway();
    
    // Build AI context
    const contextResult = await this.contextBuilderService.buildContext({
      userId,
      taskType: 'hashtag_generation',
      platform: request.platform,
      maxTokens: 400,
    });

    const promptContext = {
      ...request,
      businessContext: contextResult.contextString,
    };
    
    const systemPrompt = AIPrompts.getHashtagsSystemPrompt(promptContext);
    const prompt = AIPrompts.getHashtagsPrompt(promptContext);

    const startTime = Date.now();

    // Dynamic model selection
    const taskAnalysis = await this.modelOptimizerService.analyzeTask(
      'generate_hashtags',
      false,
      request.caption.length + contextResult.tokensUsed,
      false,
    );

    this.logger.log(
      `Generating hashtags for user ${userId}, platform: ${request.platform}, model: ${taskAnalysis.recommendedModelId}, context: ${contextResult.tokensUsed} tokens`,
    );

    try {
      const { data, metadata } = await gateway.generateJSON<{ hashtags: string[] }>(
        {
          model: taskAnalysis.recommendedModelId,
          feature: AIFeature.GENERATE_HASHTAGS,
          maxTokens: taskAnalysis.estimatedTokens,
          temperature: this.modelOptimizerService.getOptimalTemperature('generate_hashtags', 'medium'),
        },
        prompt,
        systemPrompt,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Hashtags generated in ${duration}ms, tokens: ${metadata.totalTokens}, cost: ${metadata.costBucket}`);

      setImmediate(() => {
        this.logAIUsage(userId, metadata, request, data).catch(err => 
          this.logger.error('Failed to log AI usage', err.stack)
        );
      });

      return {
        hashtags: data.hashtags,
        metadata: {
          model: metadata.model,
          costBucket: metadata.costBucket,
          totalTokens: metadata.totalTokens,
          durationMs: duration,
          contextUsed: contextResult.tokensUsed,
        },
      };
    } catch (error) {
      this.logger.error(`AI Hashtags Generation failed for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Get AI-powered suggestions
   */
  async getSuggestions(userId: number, businessType: string, goal: string) {
    // This can be enhanced with AI or use heuristics
    const suggestions = [
      {
        type: 'best_time',
        title: 'Best Time to Post',
        description: '8-10 AM shows highest engagement for your business type',
        confidence: 0.92,
      },
      {
        type: 'trending_topic',
        title: 'Trending Now',
        description: 'Seasonal content is performing well this week',
        confidence: 0.85,
      },
    ];

    return { suggestions };
  }

  /**
   * Stream AI generation for real-time responses
   */
  async *streamCaption(
    userId: number,
    request: GenerateCaptionRequest,
  ): AsyncGenerator<string> {
    const gateway = this.aiGatewayService.getGateway();
    
    const systemPrompt = AIPrompts.getCaptionSystemPrompt(request);
    const prompt = AIPrompts.getCaptionPrompt(request);

    this.logger.log(`Streaming caption for user ${userId}`);

    try {
      const stream = gateway.streamCompletion(
        {
          model: AIModel.LIGHT_MODEL,
          feature: AIFeature.GENERATE_CAPTION,
          maxTokens: 500,
          temperature: 0.8,
        },
        prompt,
        systemPrompt,
      );

      for await (const chunk of stream) {
        yield chunk;
      }

      this.logger.log(`Caption stream completed for user ${userId}`);
    } catch (error) {
      this.logger.error(`Stream failed for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Get AI analytics for user
   */
  async getAIAnalytics(userId: number, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.aiLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :since', { since })
      .getMany();

    const totalRequests = logs.length;
    const totalTokens = logs.reduce((sum, log) => sum + (log.totalTokens || 0), 0);
    const avgDuration = logs.reduce((sum, log) => sum + (log.durationMs || 0), 0) / totalRequests;

    const byFeature = logs.reduce((acc, log) => {
      if (!acc[log.feature]) {
        acc[log.feature] = { count: 0, tokens: 0, avgDuration: 0 };
      }
      acc[log.feature].count++;
      acc[log.feature].tokens += log.totalTokens || 0;
      acc[log.feature].avgDuration = (acc[log.feature].avgDuration + (log.durationMs || 0)) / acc[log.feature].count;
      return acc;
    }, {});

    const byCost = logs.reduce((acc, log) => {
      if (!acc[log.costBucket]) {
        acc[log.costBucket] = { count: 0, tokens: 0 };
      }
      acc[log.costBucket].count++;
      acc[log.costBucket].tokens += log.totalTokens || 0;
      return acc;
    }, {});

    return {
      totalRequests,
      totalTokens,
      avgDuration: Math.round(avgDuration),
      byFeature,
      byCost,
      periodDays: days,
    };
  }

  /**
   * Log AI usage for cost tracking
   */
  private async logAIUsage(
    userId: number,
    metadata: AIResponseMetadata,
    inputData: any,
    outputData: any,
  ): Promise<number | null> {
    try {
      const log = await this.aiLogRepository.save({
        userId,
        feature: metadata.feature,
        modelEnum: metadata.model,
        provider: metadata.provider,
        modelName: metadata.modelName,
        costBucket: metadata.costBucket,
        promptTokens: metadata.promptTokens,
        completionTokens: metadata.completionTokens,
        totalTokens: metadata.totalTokens,
        inputData: this.sanitizeData(inputData),
        outputData: this.sanitizeData(outputData),
        durationMs: metadata.durationMs,
        status: 'success',
        categoryKey: null,
        confidenceScore: null,
        selectedBy: 'auto',
        taskPriority: null,
        taskComplexity: null,
      });
      
      this.logger.debug(`AI usage logged: ${log.id}, tokens: ${log.totalTokens}, cost: ${log.costBucket}`);
      return log.id;
    } catch (error) {
      this.logger.error('Failed to log AI usage', error.stack);
      return null;
    }
  }

  /**
   * Sanitize data before logging (remove sensitive info)
   */
  private sanitizeData(data: any): any {
    if (!data) return null;
    
    // Create a deep copy
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove any potential sensitive fields
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey'];
    const removeSensitive = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;
      
      for (const key in obj) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          removeSensitive(obj[key]);
        }
      }
    };
    
    removeSensitive(sanitized);
    return sanitized;
  }
}
