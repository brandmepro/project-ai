# Business Pro - Enhanced Database Schema with AI Model Management

## New Tables for Intelligent AI Model Selection

### 1. ai_models
Complete catalog of all available AI models with their capabilities.

```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Model Identity
  model_id VARCHAR(100) UNIQUE NOT NULL,           -- e.g., 'openai:gpt-4o'
  model_name VARCHAR(255) NOT NULL,                 -- Display name
  provider VARCHAR(50) NOT NULL,                    -- openai, anthropic, google, etc.
  version VARCHAR(50),                              -- Model version
  
  -- Capabilities
  capabilities TEXT[] DEFAULT '{}',                 -- Array of capability tags
  supports_streaming BOOLEAN DEFAULT FALSE,
  supports_json_mode BOOLEAN DEFAULT FALSE,
  supports_function_calling BOOLEAN DEFAULT FALSE,
  supports_vision BOOLEAN DEFAULT FALSE,
  
  -- Performance
  max_tokens INTEGER,
  context_window INTEGER,
  average_speed_ms INTEGER,                         -- Average response time
  
  -- Cost
  cost_bucket VARCHAR(20) NOT NULL,                 -- low, medium, high
  cost_per_1k_input DECIMAL(10, 6),                -- Cost per 1k input tokens
  cost_per_1k_output DECIMAL(10, 6),               -- Cost per 1k output tokens
  
  -- Quality Metrics
  overall_quality_score DECIMAL(3, 2),             -- 1-5 rating
  reliability_score DECIMAL(3, 2),                 -- 0-1 (uptime, success rate)
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_recommended BOOLEAN DEFAULT FALSE,
  priority_rank INTEGER DEFAULT 0,                  -- Higher = preferred
  
  -- Metadata
  description TEXT,
  use_cases TEXT[],                                 -- Best use cases
  limitations TEXT,                                 -- Known limitations
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deprecated_at TIMESTAMP                           -- When model was deprecated
);

CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_models_active ON ai_models(is_active);
CREATE INDEX idx_ai_models_cost_bucket ON ai_models(cost_bucket);
CREATE INDEX idx_ai_models_capabilities ON ai_models USING GIN(capabilities);
```

### 2. ai_task_categories
Define task categories and their requirements.

```sql
CREATE TABLE ai_task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  category_key VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'content_caption'
  category_name VARCHAR(255) NOT NULL,               -- Display name
  description TEXT,
  
  -- Requirements
  required_capabilities TEXT[] DEFAULT '{}',         -- Must have these
  preferred_capabilities TEXT[] DEFAULT '{}',        -- Nice to have
  
  -- Defaults
  default_priority VARCHAR(20) DEFAULT 'balanced',   -- speed, balanced, quality
  default_complexity VARCHAR(20) DEFAULT 'moderate', -- simple, moderate, complex
  typical_max_tokens INTEGER,
  typical_temperature DECIMAL(3, 2),
  
  -- Categorization
  parent_category VARCHAR(100),                      -- For hierarchical grouping
  tags TEXT[] DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_categories_key ON ai_task_categories(category_key);
CREATE INDEX idx_task_categories_active ON ai_task_categories(is_active);
```

### 3. ai_model_task_mappings
Which models are best for which tasks.

```sql
CREATE TABLE ai_model_task_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  category_key VARCHAR(100) REFERENCES ai_task_categories(category_key),
  
  -- Suitability
  suitability_score DECIMAL(3, 2),                 -- 0-1, how suitable for this task
  is_recommended BOOLEAN DEFAULT FALSE,
  priority_rank INTEGER DEFAULT 0,                  -- Higher = preferred
  
  -- Performance for this task
  average_quality DECIMAL(3, 2),                    -- 1-5 based on user feedback
  average_speed_ms INTEGER,
  success_rate DECIMAL(3, 2),                       -- 0-1
  
  -- Conditions
  min_complexity VARCHAR(20),                        -- Minimum task complexity
  max_complexity VARCHAR(20),                        -- Maximum task complexity
  recommended_for_priority VARCHAR(20),              -- Which priority setting
  
  -- Stats
  total_uses INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_dislikes INTEGER DEFAULT 0,
  total_regenerates INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(model_id, category_key)
);

CREATE INDEX idx_model_task_model ON ai_model_task_mappings(model_id);
CREATE INDEX idx_model_task_category ON ai_model_task_mappings(category_key);
CREATE INDEX idx_model_task_recommended ON ai_model_task_mappings(is_recommended);
CREATE INDEX idx_model_task_score ON ai_model_task_mappings(suitability_score DESC);
```

### 4. ai_user_preferences
Track user's model preferences per task category.

```sql
CREATE TABLE ai_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  category_key VARCHAR(100) REFERENCES ai_task_categories(category_key),
  
  -- Preference Strength
  preference_score DECIMAL(3, 2),                   -- 0-1, how much user likes this model
  total_interactions INTEGER DEFAULT 0,
  
  -- Feedback Stats
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  regenerates INTEGER DEFAULT 0,
  skips INTEGER DEFAULT 0,
  
  -- Quality Ratings
  average_quality_rating DECIMAL(3, 2),            -- 1-5 from user ratings
  total_ratings INTEGER DEFAULT 0,
  
  -- Behavior
  last_used_at TIMESTAMP,
  first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, model_id, category_key)
);

CREATE INDEX idx_user_prefs_user ON ai_user_preferences(user_id);
CREATE INDEX idx_user_prefs_model ON ai_user_preferences(model_id);
CREATE INDEX idx_user_prefs_category ON ai_user_preferences(category_key);
CREATE INDEX idx_user_prefs_score ON ai_user_preferences(preference_score DESC);
```

### 5. ai_user_feedback
Individual feedback entries from users.

```sql
CREATE TABLE ai_user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ai_log_id UUID REFERENCES ai_logs(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  
  category_key VARCHAR(100) REFERENCES ai_task_categories(category_key),
  
  -- Feedback
  feedback_type VARCHAR(20) NOT NULL,               -- like, dislike, regenerate, skip
  quality_rating INTEGER,                            -- 1-5 stars
  reason TEXT,                                       -- Optional reason text
  
  -- Context
  prompt_summary TEXT,                               -- First 200 chars of prompt
  output_summary TEXT,                               -- First 200 chars of output
  
  -- Metadata
  session_id VARCHAR(100),                           -- Group related feedback
  device_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_user ON ai_user_feedback(user_id);
CREATE INDEX idx_feedback_model ON ai_user_feedback(model_id);
CREATE INDEX idx_feedback_category ON ai_user_feedback(category_key);
CREATE INDEX idx_feedback_type ON ai_user_feedback(feedback_type);
CREATE INDEX idx_feedback_created ON ai_user_feedback(created_at DESC);
```

### 6. ai_model_performance_aggregates
Pre-calculated performance metrics (updated periodically).

```sql
CREATE TABLE ai_model_performance_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  category_key VARCHAR(100) REFERENCES ai_task_categories(category_key),
  
  -- Time Period
  period_type VARCHAR(20) NOT NULL,                 -- daily, weekly, monthly, all_time
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage Stats
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 2),
  
  -- Performance
  average_speed_ms INTEGER,
  success_rate DECIMAL(5, 4),                       -- 0-1
  error_rate DECIMAL(5, 4),                         -- 0-1
  
  -- Quality Metrics
  total_feedback INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  regenerate_count INTEGER DEFAULT 0,
  average_quality_rating DECIMAL(3, 2),            -- 1-5
  
  -- Calculated Scores
  like_ratio DECIMAL(5, 4),                         -- likes / (likes + dislikes)
  satisfaction_score DECIMAL(3, 2),                 -- Composite score
  recommendation_score DECIMAL(3, 2),               -- Overall recommendation
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(model_id, category_key, period_type, period_start)
);

CREATE INDEX idx_perf_agg_model ON ai_model_performance_aggregates(model_id);
CREATE INDEX idx_perf_agg_category ON ai_model_performance_aggregates(category_key);
CREATE INDEX idx_perf_agg_period ON ai_model_performance_aggregates(period_type, period_start);
CREATE INDEX idx_perf_agg_score ON ai_model_performance_aggregates(recommendation_score DESC);
```

### 7. Enhanced ai_logs table
Add task category tracking to existing ai_logs.

```sql
-- Add new columns to existing ai_logs table
ALTER TABLE ai_logs ADD COLUMN category_key VARCHAR(100);
ALTER TABLE ai_logs ADD COLUMN task_priority VARCHAR(20);
ALTER TABLE ai_logs ADD COLUMN task_complexity VARCHAR(20);
ALTER TABLE ai_logs ADD COLUMN selected_by VARCHAR(50) DEFAULT 'auto';  -- auto, user_override, fallback
ALTER TABLE ai_logs ADD COLUMN confidence_score DECIMAL(3, 2);          -- Model selection confidence

CREATE INDEX idx_ai_logs_category ON ai_logs(category_key);
CREATE INDEX idx_ai_logs_priority ON ai_logs(task_priority);
```

## Seed Data - Initial Models

```sql
-- OpenAI Models
INSERT INTO ai_models (model_id, model_name, provider, capabilities, cost_bucket, max_tokens, context_window, is_active, is_recommended) VALUES
('openai:gpt-4o', 'GPT-4 Omni', 'openai', ARRAY['text_generation', 'text_reasoning', 'vision', 'json_mode', 'function_calling', 'streaming'], 'high', 4096, 128000, true, true),
('openai:gpt-4o-mini', 'GPT-4 Omni Mini', 'openai', ARRAY['text_generation', 'text_chat', 'json_mode', 'streaming'], 'low', 4096, 128000, true, true),
('openai:gpt-4-turbo', 'GPT-4 Turbo', 'openai', ARRAY['text_generation', 'text_reasoning', 'vision', 'json_mode'], 'high', 4096, 128000, true, false),
('openai:dall-e-3', 'DALL-E 3', 'openai', ARRAY['image_generation'], 'high', NULL, NULL, true, true);

-- Anthropic Models
INSERT INTO ai_models (model_id, model_name, provider, capabilities, cost_bucket, max_tokens, context_window, is_active, is_recommended) VALUES
('anthropic:claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'anthropic', ARRAY['text_generation', 'text_reasoning', 'vision', 'json_mode', 'streaming'], 'high', 8192, 200000, true, true),
('anthropic:claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'anthropic', ARRAY['text_generation', 'text_chat', 'streaming'], 'low', 8192, 200000, true, true);

-- Google Models
INSERT INTO ai_models (model_id, model_name, provider, capabilities, cost_bucket, max_tokens, context_window, is_active, is_recommended) VALUES
('google:gemini-2.0-flash', 'Gemini 2.0 Flash', 'google', ARRAY['text_generation', 'text_chat', 'streaming'], 'low', 8192, 1000000, true, true),
('google:gemini-1.5-pro', 'Gemini 1.5 Pro', 'google', ARRAY['text_generation', 'text_reasoning', 'vision', 'video_generation', 'streaming'], 'medium', 8192, 2000000, true, true);

-- Specialized Models
INSERT INTO ai_models (model_id, model_name, provider, capabilities, cost_bucket, is_active, is_recommended) VALUES
('stability:stable-diffusion-3', 'Stable Diffusion 3', 'stability', ARRAY['image_generation'], 'medium', true, true),
('fal:sora-turbo', 'Sora Turbo', 'fal', ARRAY['video_generation'], 'high', true, false);

-- Task Categories
INSERT INTO ai_task_categories (category_key, category_name, description, required_capabilities, default_priority, typical_max_tokens) VALUES
('content_caption', 'Social Media Captions', 'Generate captions for social media posts', ARRAY['text_generation'], 'balanced', 500),
('content_hooks', 'Attention Hooks', 'Generate attention-grabbing hooks', ARRAY['text_generation'], 'speed', 300),
('content_hashtags', 'Hashtags', 'Generate relevant hashtags', ARRAY['text_generation'], 'speed', 200),
('content_ideas', 'Content Ideas', 'Generate content ideas and storylines', ARRAY['text_generation', 'text_reasoning'], 'quality', 2000),
('image_social', 'Social Media Images', 'Generate images for social media', ARRAY['image_generation'], 'balanced', NULL),
('video_short', 'Short Videos', 'Generate short video clips', ARRAY['video_generation'], 'quality', NULL);

-- Model-Task Mappings (Best matches)
INSERT INTO ai_model_task_mappings (model_id, category_key, suitability_score, is_recommended, priority_rank) VALUES
-- Captions: Fast models preferred
((SELECT id FROM ai_models WHERE model_id = 'openai:gpt-4o-mini'), 'content_caption', 0.95, true, 1),
((SELECT id FROM ai_models WHERE model_id = 'anthropic:claude-3-5-haiku-20241022'), 'content_caption', 0.90, false, 2),

-- Content Ideas: Quality models preferred
((SELECT id FROM ai_models WHERE model_id = 'openai:gpt-4o'), 'content_ideas', 0.98, true, 1),
((SELECT id FROM ai_models WHERE model_id = 'anthropic:claude-3-5-sonnet-20241022'), 'content_ideas', 0.97, true, 2),

-- Images
((SELECT id FROM ai_models WHERE model_id = 'openai:dall-e-3'), 'image_social', 0.95, true, 1),
((SELECT id FROM ai_models WHERE model_id = 'stability:stable-diffusion-3'), 'image_social', 0.90, false, 2);
```

## Query Examples

### Get Best Model for Task
```sql
SELECT 
  am.model_id,
  am.model_name,
  am.provider,
  am.cost_bucket,
  mtm.suitability_score,
  mtm.average_quality,
  mtm.success_rate
FROM ai_model_task_mappings mtm
JOIN ai_models am ON am.id = mtm.model_id
WHERE mtm.category_key = 'content_caption'
  AND am.is_active = true
ORDER BY 
  mtm.is_recommended DESC,
  mtm.priority_rank DESC,
  mtm.suitability_score DESC
LIMIT 1;
```

### Get User's Preferred Model for Task
```sql
SELECT 
  am.model_id,
  am.model_name,
  up.preference_score,
  up.average_quality_rating
FROM ai_user_preferences up
JOIN ai_models am ON am.id = up.model_id
WHERE up.user_id = 'USER_UUID'
  AND up.category_key = 'content_caption'
  AND am.is_active = true
ORDER BY up.preference_score DESC
LIMIT 1;
```

### Model Performance Report
```sql
SELECT 
  am.model_name,
  tc.category_name,
  apa.total_requests,
  apa.success_rate,
  apa.average_quality_rating,
  apa.like_ratio,
  apa.satisfaction_score
FROM ai_model_performance_aggregates apa
JOIN ai_models am ON am.id = apa.model_id
JOIN ai_task_categories tc ON tc.category_key = apa.category_key
WHERE apa.period_type = 'all_time'
ORDER BY apa.recommendation_score DESC;
```

---

**Last Updated**: January 29, 2026  
**Schema Version**: 2.0.0 (Enhanced AI Management)
