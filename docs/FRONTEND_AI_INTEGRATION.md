# Frontend AI Model Database Integration

## Overview

This document describes the frontend integration of the AI Model Database system. The frontend now uses intelligent, database-driven model selection for all AI generation tasks, provides real-time analytics, and offers transparency into which models are being used.

## Implementation Date

February 13, 2026

## Key Features

### 1. **Smart AI Generation**
- Uses specific AI endpoints (`generateCaption`, `generateHashtags`) instead of generic task endpoint
- Automatically selects optimal model based on database-driven selection
- Passes media URLs (images/videos) for vision-enabled generation
- Shows AI metadata (model used, cost bucket, duration) in the UI

### 2. **AI Analytics Dashboard**
- Real-time tracking of AI usage and costs
- Model breakdown with request counts and costs
- Performance metrics (avg speed, avg cost, success rate)
- Filterable by time period (today, week, month)

### 3. **Model Information Transparency**
- Modal to view all available AI models
- Detailed specifications (latency, cost, capabilities)
- Organized by capability (text, vision, image generation)
- Shows which models are recommended

### 4. **Visual Feedback**
- AI badge on generated content showing model used
- Color-coded cost buckets (green=low, blue=medium, orange=high)
- Generation speed displayed in tooltip
- Loading states during AI generation

## Updated Components

### 1. Content Preview Component
**Path:** `our-app/components/create/content-preview.tsx`

**Changes:**
```typescript
// Before: Used generic task endpoint
const generateMutation = useAIControllerGenerateWithTask()

// After: Uses specific endpoints with full metadata
const generateCaptionMutation = useAIControllerGenerateCaption()
const generateHashtagsMutation = useAIControllerGenerateHashtags()

// Stores AI metadata for display
const [aiMetadata, setAiMetadata] = useState<{
  model?: string
  costBucket?: string
  durationMs?: number
}>({})
```

**Features:**
- Sequential generation (caption first, then hashtags)
- Passes image/video URLs for vision analysis
- Stores and displays AI metadata
- Fallback to mock data on error
- Shows AI badge with model info in tooltip

**API Request Example:**
```typescript
// Caption Generation
await generateCaptionMutation.mutateAsync({
  data: {
    businessType: 'cafe',
    platform: 'instagram',
    contentGoal: 'awareness',
    tone: 'friendly',
    language: 'english',
    context: 'Morning coffee special',
    imageUrl: 'https://...', // Optional
    videoUrl: 'https://...', // Optional
  }
})

// Hashtag Generation
await generateHashtagsMutation.mutateAsync({
  data: {
    caption: generatedCaption,
    businessType: 'cafe',
    platform: 'instagram',
    language: 'english',
  }
})
```

### 2. AI Analytics Card
**Path:** `our-app/components/settings/ai-analytics-card.tsx`

**Features:**
- Total AI requests counter
- Total cost tracker
- Tokens processed display
- Model usage breakdown with progress bars
- Performance stats (avg speed, avg cost, success rate)
- Time period filter (today/7 days/30 days)
- Refresh button

**Data Structure:**
```typescript
interface AIAnalytics {
  totalRequests: number
  totalCost: number
  totalTokens: number
  avgDuration: number
  avgCost: number
  successRate: number
  modelBreakdown: Array<{
    model: string
    modelName: string
    count: number
    cost: number
    avgDuration: number
    costBucket: 'low' | 'medium' | 'high'
  }>
}
```

### 3. Model Info Modal
**Path:** `our-app/components/settings/model-info-modal.tsx`

**Features:**
- Tabbed interface (Text Models, Vision Models, Image Gen)
- Detailed model cards showing:
  - Model name, provider, priority rank
  - Recommended badge for production models
  - Cost bucket indicator
  - Capabilities (Vision, Image Gen, Web Search, JSON, Streaming)
  - Performance metrics (latency, throughput, context window)
  - Cost breakdown (input/output per 1M tokens, image gen cost)
  - Best use cases
  - Available providers

**Usage:**
```typescript
import { ModelInfoModal } from '@/components/settings/model-info-modal'

const [opened, setOpened] = useState(false)

<Button onClick={() => setOpened(true)}>View Models</Button>
<ModelInfoModal opened={opened} onClose={() => setOpened(false)} />
```

### 4. AI Settings Card
**Path:** `our-app/components/settings/ai-settings-card.tsx`

**Changes:**
- Added "View Models" button to open Model Info Modal
- Shows model preference (Speed/Balanced/Quality)
- Explains what each preference means

### 5. Settings Page
**Path:** `our-app/app/(dashboard)/settings/page.tsx`

**Changes:**
- Added `AIAnalyticsCard` component (full-width at top)
- Shows AI usage analytics before other settings

### 6. Store Updates
**Path:** `our-app/lib/store.ts`

**Changes:**
```typescript
export interface CreateFlowState {
  // ... existing fields
  context?: string      // NEW: Additional context for AI
  imageUrl?: string     // NEW: Image URL for vision analysis
  videoUrl?: string     // NEW: Video URL for vision analysis
}
```

## Available Hooks

### AI Generation Hooks
```typescript
import {
  useAIControllerGenerateIdeas,
  useAIControllerGenerateCaption,
  useAIControllerGenerateHooks,
  useAIControllerGenerateHashtags,
  useAIControllerStreamCaption,
} from '@businesspro/api-client'

// Example: Generate Caption
const { mutateAsync, isLoading } = useAIControllerGenerateCaption()

const result = await mutateAsync({
  data: {
    businessType: 'cafe',
    platform: 'instagram',
    contentGoal: 'awareness',
    tone: 'friendly',
    language: 'english',
    context: 'Optional context',
    imageUrl: 'Optional image URL',
  }
})

// Result contains:
// - caption: Generated caption text
// - metadata: { model, modelName, costBucket, durationMs, tokensUsed }
```

### Model Information Hooks
```typescript
import {
  useAIControllerGetModelsByCapability,
  useAIControllerSelectModel,
} from '@businesspro/api-client'

// Get models by capability
const { data: textModels } = useAIControllerGetModelsByCapability('text')
const { data: visionModels } = useAIControllerGetModelsByCapability('vision')
const { data: imageGenModels } = useAIControllerGetModelsByCapability('image_generation')

// Select best model for a task (without executing)
const { mutateAsync: selectModel } = useAIControllerSelectModel()

const recommendation = await selectModel({
  data: {
    taskCategory: 'content_ideas',
    requiresVision: true,
    prioritizeCost: false,
  }
})

// Result contains:
// - model: Full model object
// - score: Selection score
// - reason: Why this model was chosen
// - alternatives: Other suitable models
```

### Analytics Hooks
```typescript
import {
  useAIControllerGetAnalytics,
  useAIControllerGetModelStats,
  useAIControllerGetUserPreferences,
} from '@businesspro/api-client'

// Get overall analytics
const { data: analytics } = useAIControllerGetAnalytics(
  { period: 'week' },
  { query: QUERY_CONFIG.analytics }
)

// Get stats for specific model
const { data: modelStats } = useAIControllerGetModelStats(
  { modelId: 'openai:gpt-4o', category: 'captions' }
)

// Get user AI preferences
const { data: preferences } = useAIControllerGetUserPreferences(
  { category: 'generation' }
)
```

## Query Configuration

Uses optimized React Query configuration from `lib/query-config.ts`:

```typescript
import { QUERY_CONFIG } from '@/lib/query-config'

// For AI analytics
const { data } = useAIControllerGetAnalytics(
  { period: 'today' },
  {
    query: {
      ...QUERY_CONFIG.analytics,
      staleTime: 60 * 1000, // Override to 1 minute
    },
  }
)
```

**Available Presets:**
- `QUERY_CONFIG.analytics` - 3 min stale time (default for AI analytics)
- `QUERY_CONFIG.realtime` - 10 sec stale time (for live data)
- `QUERY_CONFIG.static` - 1 hour stale time (for model list)

## UI/UX Enhancements

### 1. AI Badge on Generated Content
```typescript
{aiMetadata.model && (
  <Tooltip label={`Generated using ${aiMetadata.model} • ${aiMetadata.durationMs}ms`}>
    <Badge 
      size="xs" 
      variant="light" 
      color={
        aiMetadata.costBucket === 'low' ? 'green' : 
        aiMetadata.costBucket === 'high' ? 'orange' : 
        'blue'
      }
      leftSection={<IconSparkles size={10} />}
    >
      AI
    </Badge>
  </Tooltip>
)}
```

### 2. Color Coding
- **Green**: Low-cost models (e.g., GPT-4o-mini, Gemini Flash)
- **Blue**: Medium-cost models (e.g., GPT-4o, Claude Sonnet)
- **Orange**: High-cost models (e.g., Claude Opus, GPT-4)

### 3. Performance Indicators
- Latency displayed in milliseconds
- Throughput shown in tokens/second
- Cost shown per 1M tokens or per image

## Error Handling

All AI generation includes fallback mechanisms:

```typescript
try {
  const response = await generateCaptionMutation.mutateAsync({ data })
  // Use AI-generated content
} catch (error) {
  console.error('AI generation failed, using fallback:', error)
  // Fallback to mock data or cached content
  const { caption, hashtags } = generateFallbackContent()
  updateCreateFlow({ generatedCaption: caption, generatedHashtags: hashtags })
  setAiMetadata({}) // Clear metadata
}
```

## Performance Optimizations

### 1. Sequential Generation
- Generate caption first (can take 1-2 seconds)
- Use generated caption to generate hashtags (another 0.5-1 second)
- Total time: 1.5-3 seconds for both

### 2. Caching Strategy
```typescript
// Analytics: 3 min cache
staleTime: 3 * 60 * 1000

// Model list: 1 hour cache (rarely changes)
staleTime: 60 * 60 * 1000

// User preferences: 1 min cache
staleTime: 1 * 60 * 1000
```

### 3. Automatic Re-generation
```typescript
useEffect(() => {
  if (businessType && contentGoal && tone && language) {
    handleAIGeneration()
  }
}, [businessType, tone, contentGoal, language])
```

## Testing

### Test AI Generation
1. Navigate to `/create`
2. Fill in business type, platform, goal, tone, language
3. Observe:
   - Loading state during generation
   - Generated caption appears
   - Generated hashtags appear
   - AI badge shows model used and duration
   - Badge color reflects cost bucket

### Test AI Analytics
1. Navigate to `/settings`
2. View AI Analytics card at top
3. Observe:
   - Total requests count
   - Total cost display
   - Model breakdown with progress bars
   - Performance metrics
4. Switch time period filters (today/week/month)
5. Click refresh button

### Test Model Information
1. Navigate to `/settings`
2. Scroll to "AI & Content Settings" card
3. Click "View Models" button
4. Observe modal with:
   - Text Models tab (default)
   - Vision Models tab
   - Image Gen tab
5. Verify model cards show:
   - Specifications
   - Capabilities
   - Costs
   - Use cases

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Add streaming support for real-time caption generation
- [ ] Show live token count during generation
- [ ] Add "Regenerate with different model" option

### Phase 2 (Short-term)
- [ ] AI model comparison tool
- [ ] Cost forecasting based on usage patterns
- [ ] Custom model preferences per task type
- [ ] A/B testing for different models

### Phase 3 (Long-term)
- [ ] AI usage reports (weekly/monthly)
- [ ] Cost optimization suggestions
- [ ] Model performance leaderboard
- [ ] Custom fine-tuned model integration

## Dependencies

```json
{
  "@businesspro/api-client": "workspace:*",
  "@tanstack/react-query": "^5.x",
  "@mantine/core": "^7.x",
  "framer-motion": "^11.x",
  "@tabler/icons-react": "^3.x",
  "zustand": "^4.x"
}
```

## Related Documentation

- **Backend Implementation:** [AI_MODEL_DATABASE.md](./AI_MODEL_DATABASE.md)
- **API Reference:** [AI_INTEGRATION.md](./AI_INTEGRATION.md)
- **State Management:** [README.md](../README.md) - State Management section

## Support

For issues or questions:
1. Check backend logs for AI generation errors
2. Verify API client is up-to-date (run `npm run generate:client`)
3. Check React Query DevTools for cache status
4. Review AI Analytics for model failures

## Changelog

### v1.0.0 - 2026-02-13
- Initial frontend integration
- Added AI Analytics Card
- Added Model Info Modal
- Updated Content Preview with metadata
- Added AI Settings integration
- Updated store with image/video/context fields
