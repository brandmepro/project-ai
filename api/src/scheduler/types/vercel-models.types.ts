/**
 * Types for Vercel AI Gateway Models API
 * Based on: https://ai-gateway.vercel.sh/v1/models
 */

export interface VercelAIGatewayResponse {
  object: 'list';
  data: VercelAIModel[];
}

export interface VercelAIModel {
  id: string;
  object: 'model';
  created: number;
  released?: number;
  owned_by: string;
  name: string;
  description?: string;
  context_window: number;
  max_tokens: number;
  type: 'language' | 'embedding' | 'image';
  tags?: string[];
  pricing?: ModelPricing;
}

export interface ModelPricing {
  input?: string | number;
  output?: string | number;
  input_cache_read?: string | number;
  input_cache_write?: string | number;
  output_cache_read?: string | number;
  output_cache_write?: string | number;
  image?: string | number;
  web_search?: string | number;
  // Tiered pricing support
  input_tiers?: PricingTier[];
  output_tiers?: PricingTier[];
  input_cache_read_tiers?: PricingTier[];
}

export interface PricingTier {
  cost: string;
  min: number;
  max?: number;
}

export interface ModelSyncResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  duration?: number;
  timestamp?: Date;
}
