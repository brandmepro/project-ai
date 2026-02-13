# AI Model Database System

## Overview

We've implemented a comprehensive database-driven AI model selection system that stores all Vercel AI Gateway models with their specifications, costs, and capabilities. This allows for intelligent, dynamic model selection based on task requirements, cost constraints, and performance needs.

## Architecture

### Database Tables

#### `ai_models`
Stores all available AI models with complete specifications:

**Core Fields:**
- `model_id` (unique): Format `provider:model-name` (e.g., `openai:gpt-4o`)
- `model_name`: Human-readable name (e.g., "GPT-4o")
- `provider`: Model provider (e.g., openai, anthropic, google)
- `version`: Model version (e.g., "4o", "3.5")

**Capabilities:**
- `capabilities[]`: Text array of capabilities (text, vision, json, streaming, etc.)
- `supports_vision`: Boolean for vision/multimodal support
- `supports_image_gen`: Boolean for image generation
- `supports_video_gen`: Boolean for video generation
- `supports_web_search`: Boolean for web search integration
- `supports_streaming`: Boolean for streaming responses
- `supports_json_mode`: Boolean for structured JSON output
- `supports_function_calling`: Boolean for function/tool calling

**Performance Specs:**
- `context_window`: Maximum input context tokens
- `max_tokens`: Maximum output tokens
- `latency_ms`: Average latency in milliseconds
- `throughput_tps`: Throughput in tokens per second

**Cost Structure:**
- `cost_per_1m_input`: Cost per 1 million input tokens
- `cost_per_1m_output`: Cost per 1 million output tokens
- `cache_read_cost_per_1m`: Cache read cost per 1M tokens
- `cache_write_cost_per_1m`: Cache write cost per 1M tokens
- `image_gen_cost`: Cost per image generation
- `video_gen_cost`: Cost per video generation
- `web_search_cost`: Cost per web search query
- `cost_bucket`: Categorization (low/medium/high)

**Selection Metadata:**
- `priority_rank`: Lower number = higher priority
- `is_recommended`: Boolean for production-ready models
- `is_active`: Boolean for availability
- `available_providers[]`: List of providers offering this model
- `use_cases[]`: Optimal use cases (captions, hashtags, etc.)
- `description`: Human-readable description

#### `ai_task_categories`
Defines task categories and their requirements:

- `category_key`: Unique identifier (e.g., "content_ideas", "captions")
- `category_name`: Human-readable name
- `required_capabilities[]`: Must-have capabilities
- `preferred_capabilities[]`: Nice-to-have capabilities
- `typical_max_tokens`: Recommended token limit
- `typical_temperature`: Recommended temperature
- `default_complexity`: Task complexity level

## Seeded Models

### Text Generation Models

#### Production-Ready (Recommended)

1. **openai:gpt-4o** (Priority Rank: 1)
   - **Best for:** Complex reasoning, content ideas, multimodal tasks
   - Context: 128K | Latency: 600ms | Cost: $1.25/$10.00 per 1M
   - Vision, JSON, Streaming, Function Calling

2. **openai:gpt-4o-mini** (Priority Rank: 2)
   - **Best for:** Captions, hooks, hashtags, quick tasks
   - Context: 128K | Latency: 400ms | Cost: $0.15/$0.60 per 1M
   - Vision, JSON, Streaming (ultra cost-effective)

3. **openai:gpt-5-mini** (Priority Rank: 3)
   - **Best for:** Bulk generation, high-volume tasks
   - Context: 1000K | Latency: 300ms | Cost: $0.30/$2.50 per 1M
   - Extremely fast with massive context

4. **anthropic:claude-3.5-haiku** (Priority Rank: 4)
   - **Best for:** Fast Claude alternative
   - Context: 200K | Latency: 300ms | Cost: $0.25/$1.25 per 1M

5. **google:gemini-2.5-flash** (Priority Rank: 6)
   - **Best for:** Multimodal, bulk generation
   - Context: 1000K | Latency: 300ms | Cost: $0.30/$2.50 per 1M

6. **deepseek:deepseek-v3.2** (Priority Rank: 7)
   - **Best for:** Ultra cost-effective bulk tasks
   - Context: 164K | Latency: 1000ms | Cost: $0.26/$0.38 per 1M
   - Best cost-performance ratio

#### High-Quality (Premium)

1. **anthropic:claude-sonnet-4.5** (Priority Rank: 10)
   - **Best for:** Brand-critical, high-quality content
   - Context: 1000K | Latency: 600ms | Cost: $3.00/$15.00 per 1M

2. **openai:gpt-5** (Priority Rank: 5)
   - **Best for:** Advanced reasoning, complex strategy
   - Context: 400K | Latency: 800ms | Cost: $1.25/$10.00 per 1M

### Image Generation Models

1. **bfl:flux-2-pro** (Priority Rank: 1)
   - **Best for:** High-quality social media images
   - Cost: $0.08 per image

2. **bfl:flux-2-max** (Priority Rank: 2)
   - **Best for:** Video & image generation (multimodal)
   - Cost: $0.07 per generation

3. **bfl:flux-pro-1.1** (Priority Rank: 3)
   - **Best for:** Quick, affordable images
   - Cost: $0.04 per image

4. **google:imagen-4.0-fast-generate-001** (Priority Rank: 4)
   - **Best for:** Fast Google image generation
   - Cost: $0.04 per image

## Task Categories

### Content Ideas (`content_ideas`)
- **Complexity:** High
- **Required:** text, reasoning, json
- **Preferred:** high_quality, creativity
- **Tokens:** 2000
- **Temperature:** 0.90
- **Recommended:** gpt-4o, claude-sonnet-4.5

### Captions (`captions`)
- **Complexity:** Low
- **Required:** text, json
- **Preferred:** fast, cost_effective
- **Tokens:** 500
- **Temperature:** 0.80
- **Recommended:** gpt-4o-mini, gpt-5-mini, deepseek-v3.2

### Captions with Media (`captions_with_media`)
- **Complexity:** Medium
- **Required:** text, vision, json
- **Preferred:** multimodal
- **Tokens:** 600
- **Temperature:** 0.75
- **Recommended:** gpt-4o, gemini-2.5-flash

### Hooks (`hooks`)
- **Complexity:** Low
- **Required:** text, json
- **Preferred:** fast, creative
- **Tokens:** 300
- **Temperature:** 0.95
- **Recommended:** gpt-4o-mini, gpt-5-mini

### Hashtags (`hashtags`)
- **Complexity:** Low
- **Required:** text, json
- **Preferred:** fast, cost_effective
- **Tokens:** 200
- **Temperature:** 0.70
- **Recommended:** gpt-4o-mini, deepseek-v3.2

### Image Generation (`image_generation`)
- **Complexity:** Medium
- **Required:** image_generation
- **Preferred:** high_quality, fast
- **Recommended:** flux-2-pro, flux-pro-1.1

## Model Selection Service

### API Usage

```typescript
import { ModelSelectionService } from './services/model-selection.service';

// Inject in constructor
constructor(
  private readonly modelSelectionService: ModelSelectionService,
) {}

// Select model by task category
const recommendation = await modelSelectionService.selectModel({
  taskCategory: 'captions',
  requiresVision: true,
  prioritizeCost: true,
});

// Use the selected model
const modelId = recommendation.model.modelId;
const reason = recommendation.reason;
const alternatives = recommendation.alternatives;

// Select with custom criteria
const recommendation = await modelSelectionService.selectModel({
  requiredCapabilities: ['text', 'vision', 'json'],
  maxCostPer1mInput: 2.00,
  maxLatencyMs: 800,
  prioritizeSpeed: true,
});

// Get specific model
const model = await modelSelectionService.getModelById('openai:gpt-4o-mini');

// Get models by capability
const visionModels = await modelSelectionService.getModelsByCapability('vision');

// Estimate cost
const estimate = await modelSelectionService.estimateCost(
  'openai:gpt-4o-mini',
  1000, // input tokens
  500,  // output tokens
);
```

### Selection Criteria

```typescript
interface ModelSelectionCriteria {
  // Task-based
  taskCategory?: string;              // 'captions', 'hashtags', etc.
  
  // Capability-based
  requiredCapabilities?: string[];    // Must have these
  preferredCapabilities?: string[];   // Nice to have
  requiresVision?: boolean;           // Needs vision/multimodal
  requiresImageGen?: boolean;         // Needs image generation
  requiresWebSearch?: boolean;        // Needs web search
  
  // Cost constraints
  maxCostPer1mInput?: number;         // Max input cost
  maxCostPer1mOutput?: number;        // Max output cost
  
  // Performance constraints
  minContextWindow?: number;          // Min context window
  maxLatencyMs?: number;              // Max acceptable latency
  
  // Priorities (choose one)
  prioritizeSpeed?: boolean;          // Optimize for speed
  prioritizeCost?: boolean;           // Optimize for cost
  prioritizeQuality?: boolean;        // Optimize for quality
}
```

## Model Optimizer Service

Analyzes tasks and automatically selects optimal models:

```typescript
// Analyze task and get recommendation
const analysis = await modelOptimizerService.analyzeTask(
  'generate_caption',  // feature
  true,                // has media
  500,                 // context length
  false,               // requires creativity
);

// Use the analysis
const modelId = analysis.recommendedModelId;
const complexity = analysis.complexity;
const tokens = analysis.estimatedTokens;
const reason = analysis.reason;
const model = analysis.model; // Full model object

// Get optimal temperature
const temp = modelOptimizerService.getOptimalTemperature(
  'generate_hooks',
  'high', // creativity level
);

// Get optimal tokens
const tokens = modelOptimizerService.getOptimalMaxTokens(
  'generate_ideas',
  'high', // complexity
);
```

## Cost Optimization Strategies

### 1. Task-Based Selection
- **Simple tasks** (hashtags, short captions): Use gpt-4o-mini or deepseek-v3.2
- **Complex tasks** (ideas, strategy): Use gpt-4o or claude-sonnet-4.5
- **Vision tasks**: Use gpt-4o or gemini-2.5-flash

### 2. Bulk Generation
- Use gpt-5-mini for high-volume, large context tasks
- Use deepseek-v3.2 for maximum cost savings
- Enable caching for repeated content

### 3. Quality vs Cost
- **Production content**: gpt-4o or claude-sonnet-4.5
- **Draft/testing**: gpt-4o-mini or gpt-5-mini
- **Bulk operations**: deepseek-v3.2

### 4. Speed Optimization
- Fastest models: gpt-5-mini (300ms), gpt-4o-mini (400ms), gemini-2.5-flash (300ms)
- For real-time: gpt-4o-mini with streaming

## Migration and Seeding

The migration `1739448000000-SeedAIModels.ts`:
1. Adds new columns to `ai_models` table
2. Seeds 30+ production-ready models
3. Seeds 7 task categories
4. Sets up proper indexes and constraints

To run:
```bash
npm run typeorm:migration:run
```

To revert:
```bash
npm run typeorm:migration:revert
```

## Future Enhancements

### Planned Features
1. **Auto-Update Cron**: Periodic sync with Vercel AI Gateway API
2. **Performance Tracking**: Track actual latency, costs, and quality
3. **A/B Testing**: Compare models for specific tasks
4. **Cost Alerts**: Alert when costs exceed thresholds
5. **Model Deprecation**: Auto-handle deprecated models
6. **Regional Selection**: Select models based on user region
7. **Load Balancing**: Distribute across providers

### API Integration
```typescript
// Future: Auto-update from Vercel API
await modelService.syncWithVercelGateway();

// Future: Track performance
await modelService.recordPerformance(modelId, {
  latency: 450,
  tokensUsed: 1200,
  qualityScore: 0.92,
});

// Future: Get best model based on history
const model = await modelService.getBestModelForTask('captions', userId);
```

## Best Practices

### 1. Always Use Task Categories
```typescript
// Good
const recommendation = await modelSelectionService.selectModel({
  taskCategory: 'captions',
  requiresVision: hasImage,
});

// Avoid
const model = 'openai:gpt-4o'; // Hardcoded
```

### 2. Handle Fallbacks
```typescript
try {
  const recommendation = await modelSelectionService.selectModel(criteria);
  modelId = recommendation.model.modelId;
} catch (error) {
  logger.error('Model selection failed', error);
  modelId = 'openai:gpt-4o-mini'; // Fallback
}
```

### 3. Cost Monitoring
```typescript
// Estimate before generation
const estimate = await modelSelectionService.estimateCost(
  modelId,
  estimatedInputTokens,
  estimatedOutputTokens,
);

if (estimate.totalCost > threshold) {
  // Switch to cheaper model or alert user
}
```

### 4. Use Alternatives
```typescript
const recommendation = await modelSelectionService.selectModel(criteria);

// Primary model
try {
  return await generateWithModel(recommendation.model.modelId);
} catch (error) {
  // Try alternative
  if (recommendation.alternatives[0]) {
    return await generateWithModel(recommendation.alternatives[0].modelId);
  }
}
```

## Summary

The AI Model Database system provides:
- ✅ **30+ production models** from Vercel AI Gateway
- ✅ **Intelligent selection** based on task requirements
- ✅ **Cost optimization** with automatic cost-effective model selection
- ✅ **Performance tracking** with latency and throughput data
- ✅ **Flexible criteria** for custom model selection
- ✅ **Fallback strategies** for reliability
- ✅ **Type-safe** with full TypeScript support

This system ensures we always use the optimal model for each task while maintaining cost efficiency and high quality.
