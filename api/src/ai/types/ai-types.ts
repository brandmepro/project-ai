// Inline AI types - no external package dependency

export enum AITaskCategory {
  TEXT_SHORT = 'text_short',
  TEXT_LONG = 'text_long',
  TEXT_REASONING = 'text_reasoning',
  CONTENT_IDEAS = 'content_ideas',
  CONTENT_CAPTION = 'content_caption',
  CONTENT_HOOKS = 'content_hooks',
  CONTENT_HASHTAGS = 'content_hashtags',
  CONTENT_SCRIPT = 'content_script',
  IMAGE_PHOTO = 'image_photo',
  IMAGE_ILLUSTRATION = 'image_illustration',
  IMAGE_LOGO = 'image_logo',
  IMAGE_SOCIAL = 'image_social',
  VIDEO_SHORT = 'video_short',
  VIDEO_LONG = 'video_long',
  VIDEO_ANIMATION = 'video_animation',
  ANALYSIS_SENTIMENT = 'analysis_sentiment',
  ANALYSIS_ENGAGEMENT = 'analysis_engagement',
  ANALYSIS_TRENDS = 'analysis_trends',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  MODERATION = 'moderation',
}

export enum AITaskPriority {
  SPEED = 'speed',
  BALANCED = 'balanced',
  QUALITY = 'quality',
}

export enum AITaskComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
}

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

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  STABILITY = 'stability',
  REPLICATE = 'replicate',
  FAL = 'fal',
}

export enum FeedbackType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  REGENERATE = 'regenerate',
  SKIP = 'skip',
}

export interface AITaskRequest {
  category: AITaskCategory;
  priority?: AITaskPriority;
  complexity?: AITaskComplexity;
  userPreferenceWeight?: number;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelSelectionResult {
  modelId: number;
  modelName: string;
  provider: AIProvider;
  reason: string;
  confidence: number;
  estimatedCost: 'low' | 'medium' | 'high';
  estimatedSpeed: 'fast' | 'medium' | 'slow';
  capabilities: ModelCapability[];
}

export interface UserFeedback {
  feedbackType: FeedbackType;
  modelId: number;
  taskCategory: AITaskCategory;
  quality?: number;
  reason?: string;
}

export interface ModelPerformanceMetrics {
  modelId: number;
  taskCategory: AITaskCategory;
  totalRequests: number;
  successRate: number;
  averageQuality: number;
  averageSpeed: number;
  userSatisfaction: number;
  likeRatio: number;
  regenerateRatio: number;
}
