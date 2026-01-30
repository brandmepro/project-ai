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
   */
  private getCostBucket(model: AIModel): CostBucket {
    switch (model) {
      case AIModel.HEAVY_MODEL:
      case AIModel.VISION_MODEL:
        return CostBucket.HIGH;
      case AIModel.LIGHT_MODEL:
        return CostBucket.LOW;
      default:
        return CostBucket.MEDIUM;
    }
  }

  /**
   * Extract provider and model name from enum
   */
  private parseModelEnum(modelEnum: AIModel): { provider: string; modelName: string } {
    const [provider, ...modelParts] = modelEnum.split(':');
    return {
      provider: provider || 'unknown',
      modelName: modelParts.join(':') || 'unknown',
    };
  }

  /**
   * Generate text completion
   */
  async generateCompletion(
    config: AIRequestConfig,
    prompt: string,
    systemPrompt?: string,
  ): Promise<{ text: string; metadata: AIResponseMetadata }> {
    const startTime = Date.now();
    
    try {
      const { provider, modelName } = this.parseModelEnum(config.model);

      const result = await generateText({
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

      const durationMs = Date.now() - startTime;

      const metadata: AIResponseMetadata = {
        model: config.model,
        feature: config.feature,
        costBucket: this.getCostBucket(config.model),
        promptTokens: result.usage?.promptTokens,
        completionTokens: result.usage?.completionTokens,
        totalTokens: result.usage?.totalTokens,
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
   * Generate structured JSON response
   */
  async generateJSON<T = any>(
    config: AIRequestConfig,
    prompt: string,
    systemPrompt?: string,
    schema?: any,
  ): Promise<{ data: T; metadata: AIResponseMetadata }> {
    const startTime = Date.now();
    
    try {
      const { provider, modelName } = this.parseModelEnum(config.model);

      // Request JSON format in the prompt
      const jsonPrompt = schema 
        ? `${prompt}\n\nRespond with valid JSON matching this schema: ${JSON.stringify(schema)}`
        : `${prompt}\n\nRespond with valid JSON only.`;

      const result = await generateText({
        model: config.model as any,
        prompt: jsonPrompt,
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
        promptTokens: result.usage?.promptTokens,
        completionTokens: result.usage?.completionTokens,
        totalTokens: result.usage?.totalTokens,
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
