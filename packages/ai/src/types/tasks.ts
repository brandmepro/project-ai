/**
 * AI Task Categories - What the AI needs to do
 * This determines which model is best suited for the job
 */

export enum AITaskCategory {
  // Text Generation
  TEXT_SHORT = 'text_short',           // Captions, hooks, hashtags (fast, cheap)
  TEXT_LONG = 'text_long',             // Stories, blog posts (quality over speed)
  TEXT_REASONING = 'text_reasoning',   // Strategy, analysis, recommendations
  
  // Content Creation
  CONTENT_IDEAS = 'content_ideas',     // Generate content concepts
  CONTENT_CAPTION = 'content_caption', // Social media captions
  CONTENT_HOOKS = 'content_hooks',     // Attention-grabbing hooks
  CONTENT_HASHTAGS = 'content_hashtags', // SEO hashtags
  CONTENT_SCRIPT = 'content_script',   // Video/reel scripts
  
  // Image Generation
  IMAGE_PHOTO = 'image_photo',         // Realistic photos
  IMAGE_ILLUSTRATION = 'image_illustration', // Illustrations, art
  IMAGE_LOGO = 'image_logo',           // Brand logos
  IMAGE_SOCIAL = 'image_social',       // Social media graphics
  
  // Video Generation
  VIDEO_SHORT = 'video_short',         // Short clips (15-60s)
  VIDEO_LONG = 'video_long',           // Longer videos (1-10min)
  VIDEO_ANIMATION = 'video_animation', // Animated content
  
  // Analysis
  ANALYSIS_SENTIMENT = 'analysis_sentiment',   // Sentiment analysis
  ANALYSIS_ENGAGEMENT = 'analysis_engagement', // Engagement prediction
  ANALYSIS_TRENDS = 'analysis_trends',         // Trend analysis
  
  // Specialized
  TRANSLATION = 'translation',         // Language translation
  SUMMARIZATION = 'summarization',     // Text summarization
  MODERATION = 'moderation',           // Content moderation
}

export enum AITaskPriority {
  SPEED = 'speed',         // Fast response, lower quality OK
  BALANCED = 'balanced',   // Balance speed and quality
  QUALITY = 'quality',     // Best quality, speed less important
}

export enum AITaskComplexity {
  SIMPLE = 'simple',       // Simple task, light model OK
  MODERATE = 'moderate',   // Moderate complexity
  COMPLEX = 'complex',     // Complex task, needs heavy model
}

/**
 * AI Model Capability Tags
 */
export enum ModelCapability {
  TEXT_GENERATION = 'text_generation',
  TEXT_CHAT = 'text_chat',
  TEXT_REASONING = 'text_reasoning',
  TEXT_CODE = 'text_code',
  VISION = 'vision',
  IMAGE_GENERATION = 'image_generation',
  VIDEO_GENERATION = 'video_generation',
  AUDIO_GENERATION = 'audio_generation',
  TRANSLATION = 'translation',
  EMBEDDINGS = 'embeddings',
  FUNCTION_CALLING = 'function_calling',
  JSON_MODE = 'json_mode',
  STREAMING = 'streaming',
}

/**
 * AI Model Provider
 */
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  STABILITY = 'stability',
  REPLICATE = 'replicate',
  FAL = 'fal',
}

/**
 * Task Request with intelligent routing
 */
export interface AITaskRequest {
  category: AITaskCategory;
  priority?: AITaskPriority;
  complexity?: AITaskComplexity;
  userPreferenceWeight?: number; // 0-1, how much to weigh user's past preferences
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

import { CostBucket } from './index';

/**
 * Model Selection Result
 */
export interface ModelSelectionResult {
  modelId: string;
  modelName: string;
  provider: AIProvider;
  reason: string;
  confidence: number;
  estimatedCost: CostBucket;
  estimatedSpeed: 'fast' | 'medium' | 'slow';
  capabilities: ModelCapability[];
}

/**
 * User Feedback
 */
export enum FeedbackType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  REGENERATE = 'regenerate',
  SKIP = 'skip',
}

export interface UserFeedback {
  feedbackType: FeedbackType;
  modelId: string;
  taskCategory: AITaskCategory;
  quality?: number;
  reason?: string;
}

/**
 * Model Performance Metrics
 */
export interface ModelPerformanceMetrics {
  modelId: string;
  taskCategory: AITaskCategory;
  totalRequests: number;
  successRate: number;
  averageQuality: number;
  averageSpeed: number;
  userSatisfaction: number;
  likeRatio: number;
  regenerateRatio: number;
}
