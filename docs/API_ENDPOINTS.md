# Business Pro - API Endpoints Documentation

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.businesspro.com/v1
```

## Authentication
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication & Authorization

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Business Name",
  "businessType": "cafe"
}

Response: 201
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Business Name",
    "businessType": "cafe"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "user": { ... },
  "tokens": { ... }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}

Response: 200
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>

Response: 200
{
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Business Name",
  "businessType": "cafe",
  "createdAt": "2026-01-29T..."
}
```

---

## 👤 Users

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Business Name",
  "businessType": "cafe",
  "preferences": { ... },
  "stats": {
    "totalContent": 45,
    "publishedContent": 30,
    "scheduledContent": 10
  }
}
```

### Update User Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Business Name",
  "businessType": "salon",
  "preferences": {
    "defaultLanguage": "hindi",
    "defaultTone": "friendly"
  }
}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "New Business Name",
  ...
}
```

### Delete Account
```http
DELETE /users/account
Authorization: Bearer <token>

Response: 200
{
  "message": "Account deleted successfully"
}
```

---

## 🤖 AI Content Generation

### Generate Content Ideas
```http
POST /ai/generate/ideas
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessType": "cafe",
  "platforms": ["instagram", "facebook"],
  "contentGoal": "promotion",
  "tone": "friendly",
  "language": "english",
  "visualStyle": "clean"
}

Response: 200
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Morning Coffee Special",
      "description": "Promote your morning blend with a cozy aesthetic",
      "engagementScore": 85,
      "tags": ["Best for reach", "Trending hook"],
      "reasoning": "Morning content performs well on Instagram"
    },
    // ... up to 5 ideas
  ],
  "metadata": {
    "model": "HEAVY_MODEL",
    "generatedAt": "2026-01-29T...",
    "costBucket": "medium"
  }
}
```

### Generate Caption
```http
POST /ai/generate/caption
Authorization: Bearer <token>
Content-Type: application/json

{
  "ideaId": "idea_1",
  "businessType": "cafe",
  "contentGoal": "promotion",
  "tone": "friendly",
  "language": "english",
  "context": "Morning coffee special offer"
}

Response: 200
{
  "caption": "Start your day with a smile...",
  "alternativeCaptions": [
    "Wake up to the aroma...",
    "Morning bliss in every sip..."
  ],
  "metadata": {
    "model": "LIGHT_MODEL",
    "costBucket": "low"
  }
}
```

### Generate Hooks
```http
POST /ai/generate/hooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentType": "instagram_reel",
  "businessType": "cafe",
  "goal": "engagement"
}

Response: 200
{
  "hooks": [
    "Did you know coffee can...",
    "The secret to perfect coffee...",
    "POV: You just discovered..."
  ],
  "metadata": {
    "model": "LIGHT_MODEL",
    "costBucket": "low"
  }
}
```

### Generate Hashtags
```http
POST /ai/generate/hashtags
Authorization: Bearer <token>
Content-Type: application/json

{
  "caption": "Start your day with...",
  "businessType": "cafe",
  "platform": "instagram",
  "language": "english"
}

Response: 200
{
  "hashtags": [
    "coffeelover",
    "morningcoffee",
    "cafestyle",
    "localbusiness",
    "supportlocal"
  ],
  "metadata": {
    "model": "LIGHT_MODEL",
    "costBucket": "low"
  }
}
```

### Get AI Suggestions
```http
GET /ai/suggestions?businessType=cafe&goal=engagement
Authorization: Bearer <token>

Response: 200
{
  "suggestions": [
    {
      "type": "best_time",
      "title": "Best Time to Post",
      "description": "8-10 AM shows highest engagement for cafes",
      "confidence": 0.92
    },
    {
      "type": "trending_topic",
      "title": "Winter Specials",
      "description": "Seasonal content trending this week",
      "confidence": 0.85
    }
  ]
}
```

---

## 📝 Content Management

### List All Content
```http
GET /content?page=1&limit=20&status=all&platform=instagram
Authorization: Bearer <token>

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "caption": "Start your day...",
      "hashtags": ["coffeelover", "morningcoffee"],
      "platform": "instagram",
      "status": "scheduled",
      "scheduledFor": "2026-01-30T08:00:00Z",
      "businessType": "cafe",
      "contentGoal": "promotion",
      "engagementEstimate": 85,
      "createdAt": "2026-01-29T...",
      "updatedAt": "2026-01-29T..."
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Get Single Content
```http
GET /content/:id
Authorization: Bearer <token>

Response: 200
{
  "id": "uuid",
  "caption": "...",
  "hashtags": [...],
  "platform": "instagram",
  "status": "scheduled",
  ...
}
```

### Create Content
```http
POST /content
Authorization: Bearer <token>
Content-Type: application/json

{
  "caption": "Start your day with a smile...",
  "hashtags": ["coffeelover", "morningcoffee"],
  "platform": "instagram",
  "businessType": "cafe",
  "contentGoal": "promotion",
  "tone": "friendly",
  "language": "english",
  "visualStyle": "clean",
  "aiMetadata": {
    "ideaId": "idea_1",
    "engagementScore": 85
  }
}

Response: 201
{
  "id": "uuid",
  "caption": "...",
  ...
}
```

### Update Content
```http
PATCH /content/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "caption": "Updated caption...",
  "hashtags": ["newhashtag"]
}

Response: 200
{
  "id": "uuid",
  "caption": "Updated caption...",
  ...
}
```

### Delete Content
```http
DELETE /content/:id
Authorization: Bearer <token>

Response: 200
{
  "message": "Content deleted successfully"
}
```

### Duplicate Content
```http
POST /content/:id/duplicate
Authorization: Bearer <token>

Response: 201
{
  "id": "new_uuid",
  "caption": "...",
  ...
}
```

---

## 📅 Scheduling

### Schedule Content
```http
POST /content/:id/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledFor": "2026-01-30T08:00:00Z",
  "autoOptimize": true
}

Response: 200
{
  "id": "schedule_id",
  "contentId": "content_uuid",
  "scheduledFor": "2026-01-30T08:00:00Z",
  "status": "scheduled",
  "optimizedTime": "2026-01-30T08:15:00Z"
}
```

### Get Scheduled Content
```http
GET /schedule?startDate=2026-01-30&endDate=2026-02-05
Authorization: Bearer <token>

Response: 200
{
  "schedules": [
    {
      "id": "schedule_id",
      "content": { ... },
      "scheduledFor": "2026-01-30T08:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

### Update Schedule
```http
PATCH /schedule/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledFor": "2026-01-30T10:00:00Z"
}

Response: 200
{
  "id": "schedule_id",
  "scheduledFor": "2026-01-30T10:00:00Z",
  ...
}
```

### Cancel Schedule
```http
DELETE /schedule/:id
Authorization: Bearer <token>

Response: 200
{
  "message": "Schedule cancelled successfully"
}
```

---

## 🔗 Social Accounts

### List Connected Accounts
```http
GET /social-accounts
Authorization: Bearer <token>

Response: 200
{
  "accounts": [
    {
      "id": "uuid",
      "platform": "instagram",
      "accountName": "@mycafe",
      "accountId": "instagram_user_id",
      "isActive": true,
      "connectedAt": "2026-01-29T...",
      "lastSync": "2026-01-29T..."
    }
  ]
}
```

### Connect Social Account
```http
POST /social-accounts/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "instagram",
  "accessToken": "platform_access_token",
  "accountId": "platform_account_id",
  "accountName": "@mycafe"
}

Response: 201
{
  "id": "uuid",
  "platform": "instagram",
  "accountName": "@mycafe",
  "isActive": true
}
```

### Disconnect Social Account
```http
DELETE /social-accounts/:id
Authorization: Bearer <token>

Response: 200
{
  "message": "Account disconnected successfully"
}
```

### Check Account Status
```http
GET /social-accounts/:id/status
Authorization: Bearer <token>

Response: 200
{
  "id": "uuid",
  "platform": "instagram",
  "isActive": true,
  "tokenValid": true,
  "lastChecked": "2026-01-29T..."
}
```

---

## 📤 Publishing

### Publish Content Immediately
```http
POST /content/:id/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "platforms": ["instagram", "facebook"]
}

Response: 200
{
  "publishId": "uuid",
  "contentId": "content_uuid",
  "status": "publishing",
  "platforms": [
    {
      "platform": "instagram",
      "status": "queued"
    },
    {
      "platform": "facebook",
      "status": "queued"
    }
  ]
}
```

### Get Publishing Status
```http
GET /content/:id/publish-status
Authorization: Bearer <token>

Response: 200
{
  "contentId": "content_uuid",
  "status": "completed",
  "platforms": [
    {
      "platform": "instagram",
      "status": "published",
      "publishedAt": "2026-01-29T...",
      "postUrl": "https://instagram.com/p/..."
    },
    {
      "platform": "facebook",
      "status": "failed",
      "error": "Token expired"
    }
  ]
}
```

---

## 📊 Analytics

### Get Dashboard Stats
```http
GET /analytics/dashboard
Authorization: Bearer <token>

Response: 200
{
  "overview": {
    "totalContent": 45,
    "scheduledContent": 10,
    "publishedContent": 30,
    "draftContent": 5
  },
  "engagement": {
    "totalLikes": 1250,
    "totalComments": 89,
    "totalShares": 45,
    "averageEngagement": 18.5
  },
  "growth": {
    "contentCreated": {
      "thisWeek": 8,
      "lastWeek": 5,
      "changePercent": 60
    },
    "engagement": {
      "thisWeek": 245,
      "lastWeek": 210,
      "changePercent": 16.6
    }
  }
}
```

### Get Content Analytics
```http
GET /analytics/content/:id
Authorization: Bearer <token>

Response: 200
{
  "contentId": "uuid",
  "platform": "instagram",
  "metrics": {
    "impressions": 1250,
    "reach": 980,
    "likes": 125,
    "comments": 15,
    "shares": 8,
    "saves": 32,
    "engagementRate": 14.5
  },
  "demographics": {
    "topLocations": ["Mumbai", "Delhi", "Bangalore"],
    "ageRange": "25-34",
    "peakEngagementTime": "8:00-10:00 AM"
  }
}
```

### Get Engagement Metrics
```http
GET /analytics/engagement?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>

Response: 200
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "metrics": {
    "totalEngagement": 2450,
    "averageEngagement": 81.6,
    "topPerformingContent": [
      {
        "contentId": "uuid",
        "caption": "...",
        "engagement": 245
      }
    ]
  },
  "trends": [
    {
      "date": "2026-01-29",
      "engagement": 95
    }
  ]
}
```

---

## 🏢 Organizations (Multi-tenant ready)

### Get Current Organization
```http
GET /organizations/current
Authorization: Bearer <token>

Response: 200
{
  "id": "org_uuid",
  "name": "My Business",
  "type": "cafe",
  "plan": "free",
  "limits": {
    "monthlyContent": 50,
    "usedContent": 12
  },
  "members": [
    {
      "userId": "user_uuid",
      "role": "owner",
      "email": "user@example.com"
    }
  ]
}
```

### Update Organization Settings
```http
PATCH /organizations/current
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Business Name",
  "preferences": {
    "timezone": "Asia/Kolkata",
    "defaultLanguage": "hindi"
  }
}

Response: 200
{
  "id": "org_uuid",
  "name": "Updated Business Name",
  ...
}
```

---

## 🔔 Webhooks (Future)

### List Webhooks
```http
GET /webhooks
Authorization: Bearer <token>
```

### Create Webhook
```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["content.published", "schedule.completed"]
}
```

---

## 📈 AI Usage Logs (Admin/Internal)

### Get AI Usage
```http
GET /ai/usage?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>

Response: 200
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "usage": {
    "totalRequests": 1250,
    "byModel": {
      "HEAVY_MODEL": 250,
      "LIGHT_MODEL": 1000
    },
    "byCostBucket": {
      "low": 1000,
      "medium": 200,
      "high": 50
    },
    "estimatedCost": "₹ XXX"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2026-01-29T...",
  "path": "/api/v1/content"
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limits

- **Free Plan**: 100 requests/hour
- **Paid Plan**: 1000 requests/hour
- **AI Generation**: 50 requests/hour (all plans)

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706543400
```
