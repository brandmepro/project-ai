import { generateText, streamText } from 'ai';
import {
  AIModel,
  CostBucket,
  AIRequestConfig,
  AIResponseMetadata,
  AIGatewayError,
} from '../types';

/**
 * Vercel AI Gateway Client
 * 
 * IMPORTANT: This is the ONLY way to access AI models
 * All AI requests MUST go through this gateway
 */
export class VercelAIGateway {
  private readonly apiKey: string;

  constructor(apiKey: string, _baseURL: string = 'https://ai-gateway.vercel.sh/v1') {
    if (!apiKey) {
      throw new Error('AI_GATEWAY_API_KEY is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get cost bucket based on model type
   * Handles both AIModel enum and string model IDs
   */
  private getCostBucket(model: AIModel | string): CostBucket {
    // Handle enum values
    if (model === AIModel.HEAVY_MODEL || model === AIModel.VISION_MODEL) {
      return CostBucket.HIGH;
    }
    if (model === AIModel.LIGHT_MODEL) {
      return CostBucket.LOW;
    }
    
    // Handle string model IDs - infer from model name
    const modelStr = String(model).toLowerCase();
    
    // High cost models
    if (modelStr.includes('gpt-4o') && !modelStr.includes('mini')) {
      return CostBucket.HIGH;
    }
    if (modelStr.includes('claude') && (modelStr.includes('opus') || modelStr.includes('sonnet'))) {
      return CostBucket.HIGH;
    }
    if (modelStr.includes('gpt-5') && !modelStr.includes('mini')) {
      return CostBucket.HIGH;
    }
    
    // Low cost models
    if (modelStr.includes('mini') || modelStr.includes('haiku') || modelStr.includes('flash')) {
      return CostBucket.LOW;
    }
    if (modelStr.includes('deepseek') || modelStr.includes('llama')) {
      return CostBucket.LOW;
    }
    
    // Default to medium
    return CostBucket.MEDIUM;
  }

  /**
   * Extract provider and model name from model ID
   * Handles both AIModel enum and string model IDs (format: "provider:model-name")
   */
  private parseModelEnum(model: AIModel | string): { provider: string; modelName: string } {
    const modelStr = String(model);
    const [provider, ...modelParts] = modelStr.split(':');
    return {
      provider: provider || 'unknown',
      modelName: modelParts.join(':') || 'unknown',
    };
  }

  /**
   * Generate text completion (with optional image/video URLs)
   */
  async generateCompletion(
    config: AIRequestConfig,
    prompt: string,
    systemPrompt?: string,
    mediaUrls?: { type: 'image' | 'video'; url: string }[],
  ): Promise<{ text: string; metadata: AIResponseMetadata }> {
    const startTime = Date.now();
    
    try {
      const { provider, modelName } = this.parseModelEnum(config.model);

      // Build messages array for multimodal support
      const messages: any[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      // User message with text and optional media
      const userContent: any[] = [{ type: 'text', text: prompt }];
      
      if (mediaUrls && mediaUrls.length > 0) {
        for (const media of mediaUrls) {
          if (media.type === 'image') {
            userContent.push({
              type: 'image',
              image: media.url,
            });
          }
          // Note: Video support depends on model capabilities
        }
      }

      messages.push({ role: 'user', content: userContent });

      const result = await generateText({
        model: config.model as any,
        messages: messages.length > 0 ? messages as any : undefined,
        prompt: messages.length === 0 ? prompt : undefined,
        system: messages.length === 0 ? systemPrompt : undefined,
        maxTokens: config.maxTokens,
        temperature: config.temperature ?? 0.7,
        topP: config.topP ?? 1,
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            apiKey: this.apiKey,
          },
        },
      } as any);

      const durationMs = Date.now() - startTime;

      const metadata: AIResponseMetadata = {
        model: config.model,
        feature: config.feature,
        costBucket: this.getCostBucket(config.model),
        promptTokens: (result.usage as any)?.promptTokens || 0,
        completionTokens: (result.usage as any)?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
        durationMs,
        provider,
        modelName,
      };

      return {
        text: result.text,
        metadata,
      };
    } catch (error: any) {
      throw new AIGatewayError(
        `AI Generation failed: ${error.message}`,
        error.statusCode || 500,
        this.parseModelEnum(config.model).provider,
      );
    }
  }

  /**
   * Generate structured JSON response (with optional media)
   */
  async generateJSON<T = any>(
    config: AIRequestConfig,
    prompt: string,
    systemPrompt?: string,
    schema?: any,
    mediaUrls?: { type: 'image' | 'video'; url: string }[],
  ): Promise<{ data: T; metadata: AIResponseMetadata }> {
    const startTime = Date.now();
    
    try {
      const { provider, modelName } = this.parseModelEnum(config.model);

      // Request JSON format in the prompt
      const jsonPrompt = schema 
        ? `${prompt}\n\nRespond with valid JSON matching this schema: ${JSON.stringify(schema)}`
        : `${prompt}\n\nRespond with valid JSON only.`;

      // Build messages for multimodal if needed
      const messages: any[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      const userContent: any[] = [{ type: 'text', text: jsonPrompt }];
      
      if (mediaUrls && mediaUrls.length > 0) {
        for (const media of mediaUrls) {
          if (media.type === 'image') {
            userContent.push({ type: 'image', image: media.url });
          }
        }
      }

      messages.push({ role: 'user', content: userContent });

      const result = await generateText({
        model: config.model as any,
        messages: messages.length > 0 ? messages as any : undefined,
        prompt: messages.length === 0 ? jsonPrompt : undefined,
        system: messages.length === 0 ? systemPrompt : undefined,
        maxTokens: config.maxTokens,
        temperature: config.temperature ?? 0.7,
        topP: config.topP ?? 1,
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            apiKey: this.apiKey,
          },
        },
      } as any);

      const durationMs = Date.now() - startTime;

      // Parse JSON response
      let data: T;
      try {
        // Clean response - remove markdown code blocks if present
        let cleanedText = result.text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        throw new AIGatewayError(
          `Failed to parse AI response as JSON: ${result.text.substring(0, 100)}...`,
          500,
          provider,
        );
      }

      const metadata: AIResponseMetadata = {
        model: config.model,
        feature: config.feature,
        costBucket: this.getCostBucket(config.model),
        promptTokens: (result.usage as any)?.promptTokens || 0,
        completionTokens: (result.usage as any)?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
        durationMs,
        provider,
        modelName,
      };

      return {
        data,
        metadata,
      };
    } catch (error: any) {
      if (error instanceof AIGatewayError) {
        throw error;
      }
      
      throw new AIGatewayError(
        `AI JSON generation failed: ${error.message}`,
        error.statusCode || 500,
        this.parseModelEnum(config.model).provider,
      );
    }
  }

  /**
   * Stream text completion (for real-time responses)
   */
  async *streamCompletion(
    config: AIRequestConfig,
    prompt: string,
    systemPrompt?: string,
  ): AsyncGenerator<string> {
    try {
      const result = await streamText({
        model: config.model as any,
        prompt,
        system: systemPrompt,
        maxTokens: config.maxTokens,
        temperature: config.temperature ?? 0.7,
        topP: config.topP ?? 1,
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            apiKey: this.apiKey,
          },
        },
      } as any);

      for await (const chunk of result.textStream) {
        yield chunk;
      }
    } catch (error: any) {
      throw new AIGatewayError(
        `AI Streaming failed: ${error.message}`,
        error.statusCode || 500,
        this.parseModelEnum(config.model).provider,
      );
    }
  }
}

/**
 * Create a singleton instance
 */
let gatewayInstance: VercelAIGateway | null = null;

export function createAIGateway(apiKey: string, baseURL?: string): VercelAIGateway {
  if (!gatewayInstance) {
    gatewayInstance = new VercelAIGateway(apiKey, baseURL);
  }
  return gatewayInstance;
}

export function getAIGateway(): VercelAIGateway {
  if (!gatewayInstance) {
    throw new Error('AI Gateway not initialized. Call createAIGateway first.');
  }
  return gatewayInstance;
}
