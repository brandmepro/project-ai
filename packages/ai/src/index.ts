/**
 * @businesspro/ai
 * 
 * Centralized AI Gateway package for Business Pro
 * 
 * USAGE:
 * - Import model enums, types, and gateway client
 * - Use ONLY the gateway for all AI requests
 * - Models are selected via enums (easy to switch)
 * - NEW: Task-based intelligent model selection
 */

// Types
export * from './types';
export {
  AITaskCategory,
  AITaskPriority,
  AITaskComplexity,
  ModelCapability,
  AIProvider,
  AITaskRequest,
  ModelSelectionResult,
  FeedbackType,
  UserFeedback,
  ModelPerformanceMetrics,
} from './types/tasks';

// Gateway
export * from './gateway/vercel-ai-gateway';

// Re-export AI SDK types for convenience
export type { LanguageModel } from 'ai';
