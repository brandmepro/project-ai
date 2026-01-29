# Business Pro - Database Schema

## Database: `businesspro`
## DBMS: PostgreSQL 14+

---

## Tables Overview

1. **users** - User accounts and authentication
2. **organizations** - Business organizations (multi-tenant)
3. **organization_members** - User-Organization relationships
4. **social_accounts** - Connected social media accounts
5. **content** - Generated content and posts
6. **content_variants** - AI-generated content variations
7. **schedules** - Content scheduling information
8. **publish_history** - Publishing logs and status
9. **ai_logs** - AI usage tracking (CRITICAL)
10. **analytics** - Content performance metrics
11. **user_preferences** - User settings and preferences
12. **refresh_tokens** - JWT refresh tokens

---

## Schema Definition

### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50), -- cafe, salon, kirana, gym, etc.
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_business_type ON users(business_type);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- Business type
  plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::JSONB, -- Org-level settings
  limits JSONB DEFAULT '{"monthlyContent": 50}'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_plan ON organizations(plan);
```

### 3. organization_members
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
```

### 4. social_accounts
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- instagram, facebook, whatsapp, google-business
  account_id VARCHAR(255) NOT NULL, -- Platform's user/page ID
  account_name VARCHAR(255), -- @username or Page Name
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::JSONB, -- Platform-specific data
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform, account_id)
);

CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_org ON social_accounts(organization_id);
```

### 5. content
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Content Data
  caption TEXT NOT NULL,
  hashtags TEXT[], -- Array of hashtags
  platform VARCHAR(50) NOT NULL, -- instagram, facebook, etc.
  content_type VARCHAR(50) DEFAULT 'post', -- post, story, reel
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, published, failed
  
  -- AI Generation Metadata
  business_type VARCHAR(50),
  content_goal VARCHAR(50), -- promotion, awareness, engagement, etc.
  tone VARCHAR(50), -- friendly, professional, fun, minimal
  language VARCHAR(50), -- english, hindi, hinglish
  visual_style VARCHAR(50), -- clean, festive, modern, bold
  
  -- AI Metrics
  ai_idea_id VARCHAR(255), -- Reference to AI-generated idea
  engagement_estimate INTEGER, -- 0-100 score
  ai_tags TEXT[], -- ["Best for reach", "Trending hook"]
  
  -- Media
  media_urls TEXT[], -- URLs to images/videos
  media_metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Scheduling
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_content_user ON content(user_id);
CREATE INDEX idx_content_org ON content(organization_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_platform ON content(platform);
CREATE INDEX idx_content_scheduled ON content(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_content_created ON content(created_at);
```

### 6. content_variants
```sql
CREATE TABLE content_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  variant_type VARCHAR(50) NOT NULL, -- caption, hook, hashtag
  variant_data TEXT NOT NULL, -- The alternative content
  ai_model VARCHAR(50), -- Model enum used
  engagement_estimate INTEGER,
  
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_content ON content_variants(content_id);
CREATE INDEX idx_variants_type ON content_variants(variant_type);
```

### 7. schedules
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  scheduled_for TIMESTAMP NOT NULL,
  optimized_time TIMESTAMP, -- AI-suggested optimal time
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, processing, completed, cancelled, failed
  
  auto_optimize BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  
  executed_at TIMESTAMP,
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_content ON schedules(content_id);
CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_scheduled_for ON schedules(scheduled_for);
CREATE INDEX idx_schedules_status ON schedules(status);
```

### 8. publish_history
```sql
CREATE TABLE publish_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
  
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- queued, publishing, published, failed
  
  platform_post_id VARCHAR(255), -- ID from the social platform
  post_url TEXT, -- Public URL to the post
  
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publish_content ON publish_history(content_id);
CREATE INDEX idx_publish_platform ON publish_history(platform);
CREATE INDEX idx_publish_status ON publish_history(status);
CREATE INDEX idx_publish_created ON publish_history(created_at);
```

### 9. ai_logs (CRITICAL FOR COST TRACKING)
```sql
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Request Details
  feature VARCHAR(100) NOT NULL, -- generate_ideas, generate_caption, etc.
  model_enum VARCHAR(50) NOT NULL, -- HEAVY_MODEL, LIGHT_MODEL, etc.
  provider VARCHAR(50), -- openai, anthropic, etc.
  model_name VARCHAR(100), -- Actual model name (gpt-4, claude-3, etc.)
  
  -- Cost Tracking
  cost_bucket VARCHAR(20) NOT NULL, -- low, medium, high
  estimated_cost_usd DECIMAL(10, 4),
  
  -- Token Usage
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  
  -- Request/Response
  input_data JSONB, -- Sanitized input
  output_data JSONB, -- Sanitized output
  
  -- Metadata
  duration_ms INTEGER, -- Request duration
  status VARCHAR(50) DEFAULT 'success', -- success, error
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_org ON ai_logs(organization_id);
CREATE INDEX idx_ai_logs_feature ON ai_logs(feature);
CREATE INDEX idx_ai_logs_model ON ai_logs(model_enum);
CREATE INDEX idx_ai_logs_cost ON ai_logs(cost_bucket);
CREATE INDEX idx_ai_logs_created ON ai_logs(created_at);
```

### 10. analytics
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  
  -- Metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Calculated
  engagement_rate DECIMAL(5, 2), -- Percentage
  
  -- Demographics (JSONB for flexibility)
  demographics JSONB DEFAULT '{}'::JSONB, -- age, gender, location
  
  -- Time-based data
  peak_engagement_time VARCHAR(50),
  
  -- Sync
  last_synced_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_content ON analytics(content_id);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_analytics_engagement ON analytics(engagement_rate);
```

### 11. user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Default Settings
  default_language VARCHAR(50) DEFAULT 'english',
  default_tone VARCHAR(50) DEFAULT 'friendly',
  default_visual_style VARCHAR(50) DEFAULT 'clean',
  default_platforms TEXT[] DEFAULT ARRAY['instagram'],
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{}'::JSONB,
  
  -- UI Preferences
  theme VARCHAR(20) DEFAULT 'light',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  
  -- Other Settings
  preferences JSONB DEFAULT '{}'::JSONB, -- Flexible additional settings
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_prefs_user ON user_preferences(user_id);
```

### 12. refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  
  user_agent TEXT,
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

---

## Relationships Summary

```
users (1) ──→ (n) content
users (1) ──→ (n) social_accounts
users (1) ──→ (n) schedules
users (1) ──→ (1) user_preferences
users (1) ──→ (n) refresh_tokens

organizations (1) ──→ (n) organization_members
organizations (1) ──→ (n) content
organizations (1) ──→ (n) social_accounts

content (1) ──→ (n) content_variants
content (1) ──→ (1) schedules
content (1) ──→ (n) publish_history
content (1) ──→ (1) analytics

schedules (1) ──→ (n) publish_history
social_accounts (1) ──→ (n) publish_history
```

---

## Enums (Implement in TypeScript)

```typescript
// Business Types
enum BusinessType {
  CAFE = 'cafe',
  KIRANA = 'kirana',
  SALON = 'salon',
  GYM = 'gym',
  CLINIC = 'clinic',
  RESTAURANT = 'restaurant',
  BOUTIQUE = 'boutique',
  TEA_SHOP = 'tea-shop',
}

// Social Platforms
enum Platform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  WHATSAPP = 'whatsapp',
  GOOGLE_BUSINESS = 'google-business',
}

// Content Status
enum ContentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

// Content Goals
enum ContentGoal {
  PROMOTION = 'promotion',
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
  FESTIVAL = 'festival',
  OFFER = 'offer',
}

// Tone
enum Tone {
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  FUN = 'fun',
  MINIMAL = 'minimal',
}

// Language
enum Language {
  ENGLISH = 'english',
  HINDI = 'hindi',
  HINGLISH = 'hinglish',
}

// Visual Style
enum VisualStyle {
  CLEAN = 'clean',
  FESTIVE = 'festive',
  MODERN = 'modern',
  BOLD = 'bold',
}

// AI Models (for Vercel AI Gateway)
enum AIModel {
  HEAVY_MODEL = 'openai:gpt-4o',
  LIGHT_MODEL = 'openai:gpt-4o-mini',
  VISION_MODEL = 'openai:gpt-4o',
}

// Cost Buckets
enum CostBucket {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
```

---

## Indexes Strategy

### Query Patterns Optimized:
1. **User content lookup**: `idx_content_user`
2. **Scheduled content retrieval**: `idx_content_scheduled`
3. **Platform-specific queries**: `idx_content_platform`
4. **AI cost analysis**: `idx_ai_logs_cost`, `idx_ai_logs_feature`
5. **Analytics aggregation**: `idx_analytics_content`, `idx_analytics_engagement`

---

## Data Retention Policies

1. **ai_logs**: Retain for 90 days (archive older data)
2. **publish_history**: Retain indefinitely
3. **analytics**: Aggregate monthly, retain raw data for 1 year
4. **refresh_tokens**: Auto-delete expired tokens (> 30 days)
5. **deleted content**: Soft-delete, purge after 30 days

---

## Security Considerations

1. **Password Storage**: Use bcrypt (salt rounds: 10)
2. **Token Encryption**: Encrypt social account tokens at rest
3. **PII Protection**: Encrypt email in backups
4. **Audit Trail**: Track all sensitive operations
5. **Rate Limiting**: Implement at application layer

---

## Database Setup Commands

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create all tables (in order due to foreign keys)
-- 1. users
-- 2. organizations
-- 3. organization_members
-- 4. social_accounts
-- 5. content
-- 6. content_variants
-- 7. schedules
-- 8. publish_history
-- 9. ai_logs
-- 10. analytics
-- 11. user_preferences
-- 12. refresh_tokens

-- Create indexes (as defined above)

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publish_history_updated_at BEFORE UPDATE ON publish_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Migration Strategy

1. Use TypeORM migrations for all schema changes
2. Version all migrations sequentially
3. Test migrations on staging before production
4. Keep rollback scripts for critical migrations
5. Document all schema changes in git commit messages

---

## Performance Considerations

1. **Connection Pooling**: Max 20 connections
2. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
3. **Materialized Views**: Consider for analytics aggregations
4. **Partitioning**: Consider for ai_logs table (by month)
5. **Caching**: Redis for frequently accessed data

---

**Last Updated**: January 29, 2026  
**Database Version**: 1.0.0
