import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AITaskRequest, AITaskCategory } from './types/ai-types';
import { AILog } from './entities/ai-log.entity';
import { ModelSelectionService } from './services/model-selection.service';

// Temporary DTOs
class GenerateIdeasRequest { businessType: string; platforms: string[]; contentGoal: string; tone: string; language: string; visualStyle: string; context?: string; }
class GenerateCaptionRequest { businessType: string; contentGoal: string; tone: string; language: string; context: string; }
class GenerateHooksRequest { businessType: string; contentType: string; goal: string; language?: string; }
class GenerateHashtagsRequest { caption: string; businessType: string; platform: string; language: string; }

@Injectable()
export class AIService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(AILog)
    private aiLogRepository: Repository<AILog>,
    private modelSelectionService: ModelSelectionService,
  ) {}

  /**
   * NEW: Generate with intelligent task-based model selection
   * TODO: Implement actual AI generation
   */
  async generateWithTask(userId: string, taskRequest: AITaskRequest) {
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
   * TODO: Implement actual AI generation
   */
  async generateIdeas(
    userId: string,
    request: GenerateIdeasRequest,
  ) {
    
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

    // Temporary mock response
    return {
      ideas: [
        { id: '1', title: 'Sample Idea 1', description: 'Coming soon', engagementScore: 85, tags: ['sample'], reasoning: 'AI being set up' }
      ],
      metadata: {
        model: 'temp-model',
        costBucket: 'low',
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Generate caption for content
   * TODO: Implement actual AI generation
   */
  async generateCaption(
    userId: string,
    request: GenerateCaptionRequest,
  ) {
    
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

    // Temporary mock response
    return {
      caption: 'Sample caption - AI service being set up',
      alternativeCaptions: ['Alternative 1', 'Alternative 2'],
      metadata: {
        model: 'temp-model',
        costBucket: 'low',
      },
    };
  }

  /**
   * Generate hooks (attention grabbers)
   * TODO: Implement actual AI generation
   */
  async generateHooks(
    userId: string,
    request: GenerateHooksRequest,
  ) {
    
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

    // Temporary mock response
    return {
      hooks: ['Hook 1', 'Hook 2', 'Hook 3', 'Hook 4', 'Hook 5'],
      metadata: {
        model: 'temp-model',
        costBucket: 'low',
      },
    };
  }

  /**
   * Generate relevant hashtags
   * TODO: Implement actual AI generation
   */
  async generateHashtags(
    userId: string,
    request: GenerateHashtagsRequest,
  ) {
    
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

    // Temporary mock response
    return {
      hashtags: ['hashtag1', 'hashtag2', 'hashtag3', 'trending', 'business'],
      metadata: {
        model: 'temp-model',
        costBucket: 'low',
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
