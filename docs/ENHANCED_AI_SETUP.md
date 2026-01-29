# Enhanced AI System - Setup Guide

## 🎯 Overview

Business Pro now features an **intelligent AI model management system** that:

1. ✅ **Automatically selects the best AI model** for each task
2. ✅ **Learns from user feedback** (likes, dislikes, regenerates)
3. ✅ **Tracks model performance** across different tasks
4. ✅ **Categorizes models by capabilities** (text, image, video generation)
5. ✅ **Optimizes for speed vs quality** based on user preferences
6. ✅ **Supports multiple AI providers** (OpenAI, Anthropic, Google, etc.)

---

## 🗄️ New Database Tables

### 1. `ai_models`
Complete catalog of all available AI models.

**Key Features**:
- Model ID, name, provider
- Capabilities array (text_generation, image_generation, etc.)
- Cost bucket (low/medium/high)
- Performance metrics (speed, quality, reliability)
- Active/recommended status

### 2. `ai_task_categories`
Define what tasks the system can perform.

**Examples**:
- `content_caption` - Social media captions (light models)
- `content_ideas` - Content storylines (heavy models)
- `image_social` - Social media images (image models)
- `video_short` - Short video clips (video models)

### 3. `ai_model_task_mappings`
Links models to tasks they're good at.

**Scoring**:
- Suitability score (0-1)
- Average quality from user feedback
- Success rate
- Usage statistics

### 4. `ai_user_preferences`
Tracks what models each user prefers for each task.

**Learning**:
- Preference score (calculated from feedback)
- Like/dislike ratios
- Regenerate ratios
- Quality ratings

### 5. `ai_user_feedback`
Individual feedback entries.

**Feedback Types**:
- `like` - User liked the output
- `dislike` - User didn't like it
- `regenerate` - User wants to try again
- `skip` - User skipped this output

### 6. `ai_model_performance_aggregates`
Pre-calculated statistics for fast querying.

---

## 🚀 How It Works

### 1. Frontend Requests Generation

**Old Way** (manual model selection):
```typescript
POST /api/v1/ai/generate/caption
{
  "businessType": "cafe",
  "contentGoal": "promotion",
  "tone": "friendly",
  "language": "english",
  "context": "Morning coffee special"
}
```

**New Way** (intelligent task-based):
```typescript
POST /api/v1/ai/generate/task
{
  "category": "content_caption",
  "priority": "speed",          // speed | balanced | quality
  "complexity": "simple",        // simple | moderate | complex
  "userPreferenceWeight": 0.3,   // 0-1, how much to weigh past preferences
  "prompt": "Generate a caption for morning coffee special",
  "systemPrompt": "You are a social media expert for cafes",
  "maxTokens": 500,
  "temperature": 0.7
}
```

### 2. Backend Selects Best Model

The system scores all available models based on:
- **Task suitability** (30 points): Does the model have required capabilities?
- **Priority alignment** (20 points): Speed vs quality tradeoff
- **Complexity handling** (15 points): Can it handle this complexity?
- **User preferences** (15 points, weighted): Has user liked this model before?
- **Base quality** (20 points): Overall model quality & reliability

**Example Selection**:
```json
{
  "modelId": "openai:gpt-4o-mini",
  "modelName": "GPT-4 Omni Mini",
  "provider": "openai",
  "reason": "Fast response time, High quality model, Well-suited for this task",
  "confidence": 0.92,
  "estimatedCost": "low",
  "estimatedSpeed": "fast",
  "capabilities": ["text_generation", "json_mode", "streaming"]
}
```

### 3. Generate Content

Backend uses selected model to generate content.

### 4. User Provides Feedback

```typescript
POST /api/v1/ai/feedback
{
  "aiLogId": "uuid-from-generation",
  "modelId": "openai:gpt-4o-mini",
  "category": "content_caption",
  "feedbackType": "like",
  "qualityRating": 5,
  "reason": "Perfect caption!"
}
```

### 5. System Learns

- Updates user preference score
- Improves model selection for next time
- Aggregate statistics updated (periodically)

---

## 📊 Frontend Integration

### Get Best Model for Task
```typescript
POST /api/v1/ai/select-model
{
  "category": "content_caption",
  "priority": "balanced",
  "complexity": "simple"
}

Response:
{
  "modelId": "openai:gpt-4o-mini",
  "modelName": "GPT-4 Omni Mini",
  "reason": "Fast, high-quality, well-suited",
  "confidence": 0.92,
  "estimatedCost": "low",
  "estimatedSpeed": "fast"
}
```

### Generate with Task
```typescript
POST /api/v1/ai/generate/task
{
  "category": "content_caption",
  "priority": "speed",
  "prompt": "Caption for coffee promotion",
  "maxTokens": 300
}

Response:
{
  "data": {
    "caption": "Start your day right...",
    "alternativeCaptions": [...]
  },
  "metadata": {
    "model": "openai:gpt-4o-mini",
    "costBucket": "low",
    "modelSelection": {
      "modelId": "openai:gpt-4o-mini",
      "modelName": "GPT-4 Omni Mini",
      "reason": "Fast response time, Well-suited for this task",
      "confidence": 0.92
    },
    "logId": "uuid-for-feedback"
  }
}
```

### Send Feedback
```typescript
POST /api/v1/ai/feedback
{
  "aiLogId": "uuid-from-generation",
  "modelId": "openai:gpt-4o-mini",
  "category": "content_caption",
  "feedbackType": "like",
  "qualityRating": 5
}
```

### Get User's Preferred Models
```typescript
GET /api/v1/ai/preferences/content_caption

Response:
[
  {
    "model": {
      "modelId": "openai:gpt-4o-mini",
      "modelName": "GPT-4 Omni Mini"
    },
    "preferenceScore": 0.92,
    "averageQualityRating": 4.8,
    "totalInteractions": 45,
    "likes": 40,
    "dislikes": 2
  }
]
```

### Get Model Statistics
```typescript
GET /api/v1/ai/stats/openai:gpt-4o-mini/content_caption

Response:
{
  "totalFeedback": 250,
  "likes": 220,
  "dislikes": 15,
  "regenerates": 40,
  "averageQuality": 4.6,
  "likeRatio": 0.88
}
```

### Get Available Models for Category
```typescript
GET /api/v1/ai/models/content_caption

Response:
[
  {
    "modelId": "openai:gpt-4o-mini",
    "modelName": "GPT-4 Omni Mini",
    "provider": "openai",
    "costBucket": "low",
    "capabilities": ["text_generation", "json_mode"],
    "averageSpeedMs": 1200,
    "isRecommended": true
  },
  ...
]
```

---

## 🎨 Task Categories

### Text Generation
- `text_short` - Short text (captions, hooks)
- `text_long` - Long text (articles, stories)
- `text_reasoning` - Complex reasoning

### Content Creation
- `content_ideas` - Content concepts (heavy models)
- `content_caption` - Social captions (light models)
- `content_hooks` - Attention grabbers (light models)
- `content_hashtags` - SEO hashtags (light models)
- `content_script` - Video scripts (medium models)

### Image Generation
- `image_photo` - Realistic photos
- `image_illustration` - Illustrations/art
- `image_logo` - Brand logos
- `image_social` - Social media graphics

### Video Generation
- `video_short` - Short clips (15-60s)
- `video_long` - Longer videos (1-10min)
- `video_animation` - Animated content

### Analysis
- `analysis_sentiment` - Sentiment analysis
- `analysis_engagement` - Engagement prediction
- `analysis_trends` - Trend analysis

---

## 🔧 Database Setup

### 1. Run Enhanced Migration

```powershell
# Create new tables
psql -U postgres -d businesspro -f docs/migrations/002_enhanced_ai.sql
```

### 2. Seed Initial Data

```sql
-- See DATABASE_SCHEMA_ENHANCED.md for seed data
-- Includes:
-- - OpenAI models (GPT-4, GPT-4 Mini, DALL-E 3)
-- - Anthropic models (Claude 3.5 Sonnet, Haiku)
-- - Google models (Gemini 2.0 Flash, 1.5 Pro)
-- - Task categories
-- - Model-task mappings
```

---

## 📈 Model Selection Algorithm

### Scoring Breakdown

```
Total Score = 100 points

20 pts - Base Score (quality + reliability)
30 pts - Category Suitability (has required capabilities)
20 pts - Priority Alignment (speed vs quality)
15 pts - Complexity Handling (can handle task complexity)
15 pts - User Preference (weighted by userPreferenceWeight)
 5 pts - Recommended Bonus
 0.5 pts per Priority Rank
```

### Example Calculation

**Task**: Generate caption (simple, speed priority)

**OpenAI GPT-4 Mini**:
- Base: 18/20 (excellent quality & reliability)
- Category: 30/30 (perfect for text generation)
- Priority: 20/20 (fastest, low cost)
- Complexity: 15/15 (overkill for simple tasks)
- User Pref: 12/15 (user has liked it before)
- Bonus: 5 (recommended model)
- **Total: 100/105 ✅**

**OpenAI GPT-4**:
- Base: 20/20 (best quality)
- Category: 30/30 (perfect for text generation)
- Priority: 12/20 (slower, expensive)
- Complexity: 15/15 (handles any complexity)
- User Pref: 8/15 (neutral)
- Bonus: 5 (recommended model)
- **Total: 90/105**

Winner: **GPT-4 Mini** (faster, cheaper, still high quality)

---

## 🎯 Frontend Recommendations

### 1. Show Model Selection to User
```tsx
<div className="model-badge">
  <Icon name="sparkles" />
  <span>Using {metadata.modelSelection.modelName}</span>
  <Tooltip>{metadata.modelSelection.reason}</Tooltip>
</div>
```

### 2. Feedback Buttons
```tsx
<div className="feedback-buttons">
  <button onClick={() => sendFeedback('like')}>
    👍 Love it
  </button>
  <button onClick={() => sendFeedback('dislike')}>
    👎 Not great
  </button>
  <button onClick={() => regenerate()}>
    🔄 Try again
  </button>
</div>
```

### 3. Quality Rating
```tsx
<StarRating
  onChange={(rating) => sendFeedback('like', rating)}
  label="How was this output?"
/>
```

### 4. Model Preferences Dashboard
```tsx
<ModelPreferences category="content_caption">
  {preferences.map(pref => (
    <ModelCard
      model={pref.model}
      preferenceScore={pref.preferenceScore}
      stats={{
        likes: pref.likes,
        totalUses: pref.totalInteractions
      }}
    />
  ))}
</ModelPreferences>
```

---

## 🔮 Future Enhancements

1. **Auto-tuning**: Automatically adjust model selection based on aggregate performance
2. **A/B Testing**: Test multiple models and pick the best
3. **Cost Optimization**: Switch to cheaper models when possible
4. **Real-time Adaptation**: Adjust selection based on current API latency
5. **Multi-model Ensemble**: Use multiple models and combine outputs
6. **Custom Models**: Allow users to bring their own API keys

---

## 📚 Resources

- **Database Schema**: `docs/DATABASE_SCHEMA_ENHANCED.md`
- **API Endpoints**: Updated in `docs/API_ENDPOINTS.md`
- **Task Types**: `packages/ai/src/types/tasks.ts`
- **Model Selection Logic**: `api/src/ai/services/model-selection.service.ts`
- **Feedback System**: `api/src/ai/services/feedback.service.ts`

---

**Last Updated**: January 29, 2026  
**System Version**: 2.0.0 (Intelligent AI Management)
