import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createAIGateway,
  getAIGateway,
  AIModel,
  AIFeature,
  GenerateIdeasRequest,
  GenerateCaptionRequest,
  GenerateHooksRequest,
  GenerateHashtagsRequest,
  AITaskRequest,
  AITaskCategory,
} from '@businesspro/ai';
import { AILog } from './entities/ai-log.entity';
import { ModelSelectionService } from './services/model-selection.service';

@Injectable()
export class AIService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    @InjectRepository(AILog)
    private aiLogRepository: Repository<AILog>,
    private modelSelectionService: ModelSelectionService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ai.gatewayApiKey');
    const baseURL = this.configService.get<string>('ai.gatewayBaseUrl');
    
    if (!apiKey) {
      throw new Error('AI_GATEWAY_API_KEY is not configured');
    }

    createAIGateway(apiKey, baseURL);
  }

  /**
   * NEW: Generate with intelligent task-based model selection
   */
  async generateWithTask(userId: string, taskRequest: AITaskRequest) {
    const gateway = getAIGateway();

    // Step 1: Intelligently select the best model for this task
    const modelSelection = await this.modelSelectionService.selectBestModel(
      userId,
      taskRequest,
    );

    console.log(`✨ Selected ${modelSelection.modelName} for task (${modelSelection.reason})`);

    // Step 2: Generate using the selected model
    const { data, metadata } = await gateway.generateJSON(
      {
        model: modelSelection.modelId as any,
        feature: this.getCategoryFeature(taskRequest.category),
        maxTokens: taskRequest.maxTokens || 1500,
        temperature: taskRequest.temperature || 0.7,
      },
      taskRequest.prompt,
      taskRequest.systemPrompt,
    );

    // Step 3: Log with enhanced metadata
    const logId = await this.logAIUsage(
      userId,
      { ...metadata, ...modelSelection },
      taskRequest,
      data,
      taskRequest.category,
    );

    return {
      data,
      metadata: {
        ...metadata,
        modelSelection,
        logId, // Frontend can use this for feedback
      },
    };
  }

  /**
   * Map category to legacy feature enum
   */
  private getCategoryFeature(category: AITaskCategory): AIFeature {
    const map: Record<string, AIFeature> = {
      [AITaskCategory.CONTENT_IDEAS]: AIFeature.GENERATE_IDEAS,
      [AITaskCategory.CONTENT_CAPTION]: AIFeature.GENERATE_CAPTION,
      [AITaskCategory.CONTENT_HOOKS]: AIFeature.GENERATE_HOOKS,
      [AITaskCategory.CONTENT_HASHTAGS]: AIFeature.GENERATE_HASHTAGS,
    };

    return map[category] || AIFeature.GENERATE_CAPTION;
  }

  /**
   * Generate content ideas (5 storylines)
   */
  async generateIdeas(
    userId: string,
    request: GenerateIdeasRequest,
  ) {
    const gateway = getAIGateway();
    
    const systemPrompt = `You are a social media marketing expert for local businesses in India.
Generate engaging, relevant content ideas that are culturally appropriate and trend-aware.
Focus on ${request.businessType} businesses.`;

    const prompt = `Generate 5 unique social media content ideas for a ${request.businessType} business.

Business Context:
- Platforms: ${request.platforms.join(', ')}
- Content Goal: ${request.contentGoal}
- Tone: ${request.tone}
- Language: ${request.language}
- Visual Style: ${request.visualStyle}
${request.context ? `- Additional Context: ${request.context}` : ''}

For each idea, provide:
1. A catchy title
2. Brief description (2-3 sentences)
3. Engagement score (0-100)
4. 2-3 relevant tags (e.g., "Best for reach", "Trending hook", "High engagement")
5. Brief reasoning why this will work

Respond with valid JSON in this format:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "...",
      "description": "...",
      "engagementScore": 85,
      "tags": ["Best for reach", "Trending hook"],
      "reasoning": "..."
    }
  ]
}`;

    const { data, metadata } = await gateway.generateJSON(
      {
        model: AIModel.HEAVY_MODEL,
        feature: AIFeature.GENERATE_IDEAS,
        maxTokens: 2000,
        temperature: 0.8,
      },
      prompt,
      systemPrompt,
    );

    // Log AI usage
    await this.logAIUsage(userId, metadata, request, data);

    return {
      ideas: data.ideas,
      metadata: {
        model: metadata.model,
        costBucket: metadata.costBucket,
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Generate caption for content
   */
  async generateCaption(
    userId: string,
    request: GenerateCaptionRequest,
  ) {
    const gateway = getAIGateway();
    
    const systemPrompt = `You are a social media copywriter expert for local businesses in India.
Write engaging captions in a ${request.tone} tone and ${request.language} language.
Keep captions concise, engaging, and culturally relevant.`;

    const prompt = `Write a compelling social media caption for a ${request.businessType} business.

Context:
- Business Type: ${request.businessType}
- Goal: ${request.contentGoal}
- Tone: ${request.tone}
- Language: ${request.language}
- Details: ${request.context}

Also provide 2 alternative captions with different approaches.

Respond with valid JSON:
{
  "caption": "main caption here",
  "alternativeCaptions": ["alternative 1", "alternative 2"]
}`;

    const { data, metadata } = await gateway.generateJSON(
      {
        model: AIModel.LIGHT_MODEL,
        feature: AIFeature.GENERATE_CAPTION,
        maxTokens: 500,
        temperature: 0.7,
      },
      prompt,
      systemPrompt,
    );

    await this.logAIUsage(userId, metadata, request, data);

    return {
      caption: data.caption,
      alternativeCaptions: data.alternativeCaptions || [],
      metadata: {
        model: metadata.model,
        costBucket: metadata.costBucket,
      },
    };
  }

  /**
   * Generate hooks (attention grabbers)
   */
  async generateHooks(
    userId: string,
    request: GenerateHooksRequest,
  ) {
    const gateway = getAIGateway();
    
    const systemPrompt = `You are an expert in creating viral social media hooks that grab attention.
Generate hooks suitable for ${request.businessType} businesses in India.`;

    const prompt = `Generate 5 attention-grabbing hooks for ${request.contentType} content.

Business: ${request.businessType}
Goal: ${request.goal}
Language: ${request.language || 'English'}

Hooks should:
- Start with strong attention grabbers
- Be suitable for the first 3 seconds of a video or the opening line of a post
- Use patterns like: "POV:", "Did you know...", "The secret to...", etc.

Respond with valid JSON:
{
  "hooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"]
}`;

    const { data, metadata } = await gateway.generateJSON(
      {
        model: AIModel.LIGHT_MODEL,
        feature: AIFeature.GENERATE_HOOKS,
        maxTokens: 300,
        temperature: 0.8,
      },
      prompt,
      systemPrompt,
    );

    await this.logAIUsage(userId, metadata, request, data);

    return {
      hooks: data.hooks || [],
      metadata: {
        model: metadata.model,
        costBucket: metadata.costBucket,
      },
    };
  }

  /**
   * Generate relevant hashtags
   */
  async generateHashtags(
    userId: string,
    request: GenerateHashtagsRequest,
  ) {
    const gateway = getAIGateway();
    
    const systemPrompt = `You are a social media SEO expert specializing in hashtag optimization for ${request.platform}.
Generate relevant, trending, and niche hashtags for local businesses in India.`;

    const prompt = `Generate 10 relevant hashtags for this content:

Caption: "${request.caption}"
Business: ${request.businessType}
Platform: ${request.platform}
Language: ${request.language}

Include:
- 2-3 broad hashtags (high volume)
- 4-5 niche hashtags (targeted)
- 2-3 local/regional hashtags

Respond with valid JSON:
{
  "hashtags": ["hashtag1", "hashtag2", ...]
}

Do NOT include the # symbol in hashtags.`;

    const { data, metadata } = await gateway.generateJSON(
      {
        model: AIModel.LIGHT_MODEL,
        feature: AIFeature.GENERATE_HASHTAGS,
        maxTokens: 200,
        temperature: 0.5,
      },
      prompt,
      systemPrompt,
    );

    await this.logAIUsage(userId, metadata, request, data);

    return {
      hashtags: data.hashtags || [],
      metadata: {
        model: metadata.model,
        costBucket: metadata.costBucket,
      },
    };
  }

  /**
   * Get AI-powered suggestions
   */
  async getSuggestions(userId: string, businessType: string, goal: string) {
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
   * Log AI usage for cost tracking (CRITICAL)
   */
  private async logAIUsage(
    userId: string,
    metadata: any,
    inputData: any,
    outputData: any,
    categoryKey?: string,
  ): Promise<string | null> {
    try {
      const log = await this.aiLogRepository.save({
        userId,
        feature: metadata.feature,
        modelEnum: metadata.model || metadata.modelId,
        provider: metadata.provider,
        modelName: metadata.modelName,
        costBucket: metadata.costBucket || metadata.estimatedCost,
        promptTokens: metadata.promptTokens,
        completionTokens: metadata.completionTokens,
        totalTokens: metadata.totalTokens,
        inputData: this.sanitizeData(inputData),
        outputData: this.sanitizeData(outputData),
        durationMs: metadata.durationMs,
        status: 'success',
        categoryKey: categoryKey ?? null,
        confidenceScore: metadata.confidence ?? null,
        selectedBy: 'auto',
        taskPriority: null,
        taskComplexity: null,
      });
      
      return log.id;
    } catch (error) {
      console.error('Failed to log AI usage:', error);
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
