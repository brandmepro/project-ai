/**
 * AI Model Enums - Single source of truth for model selection
 * CRITICAL: Only change enum values to switch models globally
 */

export enum AIModel {
  // Heavy Models - For complex reasoning, story generation
  HEAVY_MODEL = 'openai:gpt-4o',
  
  // Light Models - For captions, hooks, hashtags, rewrites
  LIGHT_MODEL = 'openai:gpt-4o-mini',
  
  // Vision Models - For image understanding and generation guidance
  VISION_MODEL = 'openai:gpt-4o',
  
  // Future: Add other providers easily
  // ANTHROPIC_HEAVY = 'anthropic:claude-3-5-sonnet-20241022',
  // ANTHROPIC_LIGHT = 'anthropic:claude-3-5-haiku-20241022',
}

export enum CostBucket {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum AIFeature {
  GENERATE_IDEAS = 'generate_ideas',
  GENERATE_CAPTION = 'generate_caption',
  GENERATE_HOOKS = 'generate_hooks',
  GENERATE_HASHTAGS = 'generate_hashtags',
  GENERATE_SUGGESTIONS = 'generate_suggestions',
  ENGAGEMENT_ESTIMATE = 'engagement_estimate',
}

/**
 * AI Request Configuration
 * Note: model can be either AIModel enum OR string model ID (e.g., "openai:gpt-4o", "google:gemini-2.5-flash")
 */
export interface AIRequestConfig {
  model: AIModel | string;
  feature: AIFeature;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * AI Response Metadata
 */
export interface AIResponseMetadata {
  model: AIModel | string;
  feature: AIFeature;
  costBucket: CostBucket;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs: number;
  provider: string;
  modelName: string;
}

/**
 * Content Generation Types
 */
export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  engagementScore: number;
  tags: string[];
  reasoning: string;
}

export interface GenerateIdeasRequest {
  businessType: string;
  platforms: string[];
  contentGoal: string;
  tone: string;
  language: string;
  visualStyle: string;
  context?: string;
}

export interface GenerateIdeasResponse {
  ideas: ContentIdea[];
  metadata: AIResponseMetadata;
}

export interface GenerateCaptionRequest {
  ideaId?: string;
  businessType: string;
  contentGoal: string;
  tone: string;
  language: string;
  context: string;
}

export interface GenerateCaptionResponse {
  caption: string;
  alternativeCaptions: string[];
  metadata: AIResponseMetadata;
}

export interface GenerateHooksRequest {
  contentType: string;
  businessType: string;
  goal: string;
  language?: string;
}

export interface GenerateHooksResponse {
  hooks: string[];
  metadata: AIResponseMetadata;
}

export interface GenerateHashtagsRequest {
  caption: string;
  businessType: string;
  platform: string;
  language: string;
}

export interface GenerateHashtagsResponse {
  hashtags: string[];
  metadata: AIResponseMetadata;
}

/**
 * Error Types
 */
export class AIGatewayError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public provider?: string,
  ) {
    super(message);
    this.name = 'AIGatewayError';
  }
}
