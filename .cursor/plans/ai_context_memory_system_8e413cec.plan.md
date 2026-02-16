---
name: AI Context Memory System
overview: Implement a ChatGPT-style memory/context system that maintains rich business context per user and platform account, enabling personalized AI content generation with optimized token usage through smart context injection and vector embeddings.
todos:
  - id: create-business-profile-entity
    content: Create business_profiles entity with comprehensive business context fields
    status: pending
  - id: create-platform-context-entity
    content: Create platform_account_contexts entity for per-platform context
    status: pending
  - id: create-ai-memories-entity
    content: Create ai_memories entity with vector embeddings support
    status: pending
  - id: create-context-templates-entity
    content: Create context_templates entity for reusable snippets
    status: pending
  - id: implement-embedding-service
    content: Implement embedding service using text-embedding-3-small model
    status: pending
  - id: implement-context-builder
    content: Create context builder service with token budget management
    status: pending
  - id: implement-memory-manager
    content: Create memory manager with semantic search and auto-learning
    status: pending
  - id: update-ai-prompts
    content: Update AI prompt templates to accept and use context
    status: pending
  - id: integrate-context-ai-service
    content: Integrate context builder into all AI generation methods
    status: pending
  - id: add-auto-learning-hooks
    content: Add auto-learning from feedback and user edits
    status: pending
  - id: create-context-api-endpoints
    content: Create REST endpoints for context management
    status: pending
  - id: create-business-profile-ui
    content: Build business profile setup wizard UI
    status: pending
  - id: add-context-preview-ui
    content: Add context preview in create flow to show what AI sees
    status: pending
  - id: implement-memory-dashboard
    content: Create memory management dashboard for users
    status: pending
isProject: false
---

# AI Context Memory System Implementation

## Current State Analysis

Your application currently has:

- Basic user business info: `businessName`, `businessType`, `businessDescription` in `[api/src/users/entities/user.entity.ts](api/src/users/entities/user.entity.ts)`
- Platform connections: `[api/src/platforms/entities/platform-connection.entity.ts](api/src/platforms/entities/platform-connection.entity.ts)` with basic metadata
- AI generation uses simple prompts without persistent context from `[api/src/ai/prompts/ai-prompts.ts](api/src/ai/prompts/ai-prompts.ts)`
- No memory system or context retention across sessions

## Architecture Design

### Database Schema (New Tables)

**1. Business Profile Context (`business_profiles`)**
Store comprehensive business context per user:

- Rich business description, products/services, unique selling points
- Brand voice guidelines, tone preferences, do's and don'ts
- Target audience demographics and psychographics
- Brand assets: logo URLs, color schemes, fonts
- Success metrics and KPIs

**2. Platform Account Context (`platform_account_contexts`)**
Per-platform context (separate for each connected account):

- Account-specific bio, audience insights, posting patterns
- Historical performance data per platform
- Platform-specific preferences and optimizations
- Account avatar/profile images

**3. AI Memory Entries (`ai_memories`)**
ChatGPT-style memory system:

- Key facts learned from interactions (user corrections, preferences)
- Conversation context and learnings
- Vector embeddings for semantic search (using text-embedding models)
- Auto-expires old/irrelevant memories

**4. Context Templates (`context_templates`)**
Reusable context snippets:

- Product descriptions, service offerings
- Common campaigns and themes
- Seasonal content patterns

### Token Optimization Strategy

**Smart Context Injection (Multi-Tier System):**

**Tier 1 - Core Context (Always Included, ~100-200 tokens):**

```
Business: {businessName} - {businessType}
Voice: {tone} | Audience: {targetAudience}
Key Info: {topMemories[0-3]}
```

**Tier 2 - Task-Specific Context (~200-400 tokens):**

- Festival post → Include brand colors, past successful festival posts
- Product promotion → Include product details, USPs
- Engagement post → Include audience insights, trending topics

**Tier 3 - Extended Context (Optional, ~400-800 tokens):**

- Detailed brand guidelines
- Full product catalog
- Historical performance analytics
- Only included for complex tasks or when explicitly needed

**Vector Embedding Search:**

- Store all memories/context as embeddings
- Semantic search to fetch only relevant context (top 5 most relevant)
- Use cheap embedding models (text-embedding-3-small: $0.00000002/1M tokens)

**Dynamic Context Selection Algorithm:**

```typescript
1. Identify task type (caption, ideas, hashtags)
2. Calculate available token budget (based on model context window)
3. Reserve tokens: Task (60%) | Context (30%) | Output (10%)
4. Semantic search memories for top-N relevant to current task
5. Build minimal context string with highest-priority info
6. Include platform-specific context only if platform is specified
```

## Implementation Structure

### New Entities

`**api/src/context/entities/business-profile.entity.ts**`

- Comprehensive business information
- Brand identity and voice
- Products/services catalog

`**api/src/context/entities/platform-account-context.entity.ts**`

- Per-platform account details
- Platform-specific optimizations
- Audience insights per platform

`**api/src/context/entities/ai-memory.entity.ts**`

- Memory entries with vector embeddings
- Importance scores and expiry
- Semantic searchable context

`**api/src/context/entities/context-template.entity.ts**`

- Reusable context snippets
- Category-based organization

### New Services

`**api/src/context/services/context-builder.service.ts**`
Core service for building optimized context:

- `buildContext(userId, taskType, platform?)` → returns optimized context string
- Token budget management
- Semantic memory search
- Context prioritization logic

`**api/src/context/services/memory-manager.service.ts**`
Manages AI memories:

- `addMemory(userId, content, category)` → creates memory with embedding
- `searchMemories(userId, query, topK)` → semantic search
- `pruneMemories(userId)` → remove old/irrelevant memories
- Auto-learning from user corrections and feedback

`**api/src/context/services/embedding.service.ts**`
Vector embedding management:

- Generate embeddings using `text-embedding-3-small`
- Batch processing for efficiency
- Caching strategy

### Integration Points

**Update `AIService` methods:**

Before (current):

```typescript
const systemPrompt = AIPrompts.getCaptionSystemPrompt(request);
```

After (with context):

```typescript
const context = await this.contextBuilder.buildContext(
  userId,
  'caption_generation',
  request.platform
);
const systemPrompt = AIPrompts.getCaptionSystemPromptWithContext(request, context);
```

**Auto-Learning Pipeline:**

1. User generates content → Extract key business info
2. User provides feedback → Learn preferences
3. User edits AI output → Store as correction/preference
4. System automatically updates memories without user intervention

### Context Storage Examples

**Business Profile Context:**

```json
{
  "businessName": "Brew & Beans Cafe",
  "businessType": "cafe",
  "description": "Artisan coffee shop specializing in cold brews and organic teas",
  "brandVoice": {
    "tone": "friendly and welcoming",
    "keywords": ["artisan", "organic", "handcrafted"],
    "avoidWords": ["cheap", "fast", "instant"]
  },
  "products": [
    { "name": "Signature Cold Brew", "price": "₹180", "highlight": true },
    { "name": "Organic Green Tea", "price": "₹120" }
  ],
  "targetAudience": "Young professionals, 25-35, health-conscious",
  "uniqueSellingPoints": [
    "100% organic ingredients",
    "Instagram-worthy interiors",
    "Free WiFi and workspace"
  ],
  "brandAssets": {
    "logoUrl": "https://...",
    "primaryColor": "#8B4513",
    "secondaryColor": "#F5DEB3"
  }
}
```

**AI Memory Examples:**

```json
[
  {
    "content": "User prefers to highlight organic ingredients in every post",
    "category": "preference",
    "importance": 0.9,
    "embedding": [0.123, -0.456, ...]
  },
  {
    "content": "Best performing posts mention free WiFi and workspace",
    "category": "performance_insight",
    "importance": 0.85
  },
  {
    "content": "Avoid using too many emojis - user prefers minimal style",
    "category": "style_preference",
    "importance": 0.8
  }
]
```

## Token Efficiency Gains

**Current approach (estimated):**

- Generic prompt: ~500 tokens
- No context about business
- Total: ~500 tokens/request

**New approach (estimated):**

- Optimized context: ~200-300 tokens (only relevant info)
- Smart prompt with context: ~300 tokens
- Total: ~500-600 tokens/request BUT with 10x better personalization

**For embedding storage:**

- Cost: $0.00000002 per 1M tokens (extremely cheap)
- 1000 memories = ~100K tokens = $0.002 total cost
- Negligible cost for massive context retention

## Migration Strategy

**Phase 1: Core Tables**

- Create `business_profiles` table
- Create `platform_account_contexts` table
- Migrate existing user data

**Phase 2: Memory System**

- Create `ai_memories` table with vector column
- Implement embedding service
- Build context builder

**Phase 3: Integration**

- Update AI prompts to use context
- Add auto-learning from feedback
- Implement memory pruning

**Phase 4: UI Enhancements**

- Business profile setup wizard
- Memory management dashboard
- Context preview in generation flow

## API Endpoints

**Context Management:**

- `POST /api/v1/context/profile` - Update business profile
- `GET /api/v1/context/profile` - Get business profile
- `POST /api/v1/context/memories` - Manually add memory
- `GET /api/v1/context/memories` - View all memories
- `DELETE /api/v1/context/memories/:id` - Remove memory
- `POST /api/v1/context/platform/:platform` - Update platform context

**Admin/Debug:**

- `GET /api/v1/context/preview/:userId` - Preview context that AI sees
- `POST /api/v1/context/optimize` - Trigger memory optimization

## Example: Context in Action

**User creates festival post for their cafe:**

**AI receives:**

```
BUSINESS CONTEXT:
Brew & Beans Cafe (Artisan Coffee Shop)
- Specializes in cold brews & organic teas
- Target: Young professionals, health-conscious
- USPs: 100% organic, Instagram-worthy, Free WiFi

MEMORIES:
- Always highlight organic ingredients
- Best posts mention free WiFi
- User prefers minimal emoji usage

PLATFORM: Instagram
- Audience: 2.5K followers, 4.2% engagement rate
- Best posting time: 7-9 AM, 6-8 PM
- Top performing: Product showcases with ambiance shots

TASK: Festival post for Holi
```

**Result:** Hyper-personalized content that sounds like the brand, includes their USPs, and optimized for their audience - all automatically!

## Token Budget Example

For a model with 128K context window:

- Reserve 8K for output (max_tokens)
- Reserve 2K for system prompt
- Available: 118K tokens

Context allocation:

- Core business context: 200 tokens (0.17%)
- Relevant memories (5): 400 tokens (0.34%)
- Platform context: 150 tokens (0.13%)
- Task-specific: 250 tokens (0.21%)
- **Total context: 1,000 tokens (0.85%)**
- Leaves 117K tokens for actual prompt/task

## Auto-Learning Examples

**Scenario 1: User edits AI output**

```
AI Generated: "Check out our new cold brew! ☕🎉✨"
User Edited: "Introducing our signature cold brew"
→ Learn: User prefers professional language, minimal emojis
```

**Scenario 2: User provides feedback**

```
User: Thumbs down on caption
Reason: "Too casual for our brand"
→ Learn: Increase professionalism score, adjust tone
```

**Scenario 3: Performance tracking**

```
Post with "organic ingredients" mention: 450 likes
Post without: 200 likes
→ Learn: Always include "organic" in context
```

