# 🚀 Quick Start - Business Pro Backend

Get your Business Pro backend running in 5 minutes!

## Prerequisites

✅ Node.js 18+ installed  
✅ PostgreSQL 14+ installed  
✅ Bun installed (https://bun.sh)

---

## Step 1: Create Database

Open PowerShell and create the database:

```powershell
psql -U postgres
```

In psql:
```sql
CREATE DATABASE businesspro;
\q
```

---

## Step 2: Install Dependencies

```powershell
# Navigate to project root
cd D:\Projects\BusinessPro

# Install everything (single command!)
bun install

# Build AI package
bun run build:ai
```

---

## Step 3: Verify Environment

Your `.env` file is already configured at `D:\Projects\BusinessPro\api\.env`:

```env
DATABASE_NAME=businesspro
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

AI_GATEWAY_API_KEY=vck_1EXBkRPkJSsc3BOptr7dAGVvJE4IXfAXdU5s8yR1bc45ZEgvi53wxtil
```

**⚠️ Important**: If your PostgreSQL password is different, update it in `.env`

---

## Step 4: Start Dev Servers

```powershell
cd D:\Projects\BusinessPro
bun dev
```

This starts both frontend and backend!

You should see:
```
🚀 Business Pro API running on: http://localhost:3000/api/v1
🌐 Frontend running on: http://localhost:3001
```

---

## Step 5: Test the API

### A. Register a User

```powershell
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@mycafe.com\",
    \"password\": \"SecurePass123!\",
    \"name\": \"My Cafe Business\",
    \"businessType\": \"cafe\"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@mycafe.com",
    "name": "My Cafe Business",
    "businessType": "cafe"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

✅ **Save the `accessToken`** - you'll need it for the next steps!

---

### B. Login

```powershell
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@mycafe.com\",
    \"password\": \"SecurePass123!\"
  }'
```

---

### C. Get Current User

Replace `YOUR_ACCESS_TOKEN` with the token from step A:

```powershell
curl -X GET http://localhost:3000/api/v1/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "email": "test@mycafe.com",
  "name": "My Cafe Business",
  "businessType": "cafe",
  "createdAt": "2026-01-29T..."
}
```

✅ **Authentication is working!**

---

### D. Generate AI Content Ideas

```powershell
curl -X POST http://localhost:3000/api/v1/ai/generate/ideas `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"businessType\": \"cafe\",
    \"platforms\": [\"instagram\"],
    \"contentGoal\": \"promotion\",
    \"tone\": \"friendly\",
    \"language\": \"english\",
    \"visualStyle\": \"clean\"
  }'
```

**Expected Response:**
```json
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Morning Coffee Special",
      "description": "Promote your morning blend...",
      "engagementScore": 85,
      "tags": ["Best for reach", "Trending hook"],
      "reasoning": "Morning content performs well..."
    },
    // ... 4 more ideas
  ],
  "metadata": {
    "model": "openai:gpt-4o",
    "costBucket": "high",
    "generatedAt": "2026-01-29T..."
  }
}
```

✅ **AI Generation is working!**

---

### E. Generate Caption

```powershell
curl -X POST http://localhost:3000/api/v1/ai/generate/caption `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"businessType\": \"cafe\",
    \"contentGoal\": \"promotion\",
    \"tone\": \"friendly\",
    \"language\": \"english\",
    \"context\": \"Promoting our new cold brew coffee\"
  }'
```

---

## Step 6: Verify Database

```powershell
psql -U postgres -d businesspro
```

In psql:
```sql
-- View all tables
\dt

-- View registered users
SELECT email, name, business_type FROM users;

-- View AI usage logs
SELECT feature, model_enum, cost_bucket, created_at 
FROM ai_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- Exit
\q
```

✅ **Database is working!**

---

## 🎉 Success!

Your backend is fully operational with:

- ✅ User authentication (email/password)
- ✅ JWT tokens (access + refresh)
- ✅ AI content generation via Vercel AI Gateway
- ✅ PostgreSQL database
- ✅ AI usage logging

---

## 📖 Next Steps

### 1. Explore the API

**Full API Documentation**: `D:\Projects\BusinessPro\docs\API_ENDPOINTS.md`

Available endpoints:
- Authentication: register, login, refresh, logout
- Users: profile, update, delete
- AI: ideas, captions, hooks, hashtags, suggestions

### 2. Check AI Usage Logs

```sql
-- Total AI requests
SELECT COUNT(*) FROM ai_logs;

-- Breakdown by feature
SELECT feature, COUNT(*) 
FROM ai_logs 
GROUP BY feature;

-- Cost analysis
SELECT cost_bucket, COUNT(*), SUM(total_tokens) 
FROM ai_logs 
GROUP BY cost_bucket;
```

### 3. Test in Postman/Insomnia

Import this base URL: `http://localhost:3000/api/v1`

Add `Authorization: Bearer <token>` header for protected routes.

### 4. Connect Frontend

Your frontend at `/frontend/our-app` can now call:
```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Generate AI content
const ideas = await fetch(`${API_BASE_URL}/ai/generate/ideas`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ businessType: 'cafe', ... }),
});
```

---

## 🐛 Troubleshooting

### PostgreSQL Not Running

```powershell
Get-Service -Name "postgresql*"
Start-Service -Name "postgresql-x64-14"  # Adjust version
```

### Port 3000 Already in Use

Edit `D:\Projects\BusinessPro\api\.env`:
```env
PORT=3001
```

### Module Not Found: @businesspro/ai

```powershell
cd D:\Projects\BusinessPro\packages\ai
pnpm run build
```

### Database Connection Error

Check your PostgreSQL password:
```powershell
cd D:\Projects\BusinessPro\api
notepad .env  # Edit DATABASE_PASSWORD
```

---

## 📚 Documentation

- **Setup Complete**: `/docs/SETUP_COMPLETE.md`
- **API Endpoints**: `/docs/API_ENDPOINTS.md`
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`
- **Backend README**: `/api/README.md`
- **AI Package README**: `/packages/ai/README.md`

---

## 🔑 Important Files

```
D:\Projects\BusinessPro\
├── api\.env                     ← Environment variables
├── api\src\
│   ├── auth\                    ← Authentication
│   ├── users\                   ← User management
│   └── ai\                      ← AI generation
├── packages\ai\                 ← AI Gateway package
└── docs\                        ← Documentation
```

---

## ✨ Features Available

### Authentication
- ✅ Email/password registration
- ✅ Login with JWT tokens
- ✅ Token refresh
- ✅ Logout with token revocation
- ✅ Profile management

### AI Generation
- ✅ Content ideas (5 storylines)
- ✅ Captions (with alternatives)
- ✅ Hooks (attention grabbers)
- ✅ Hashtags (SEO optimized)
- ✅ Suggestions (timing, trends)

### Database
- ✅ User accounts
- ✅ Organizations (multi-tenant)
- ✅ Content storage
- ✅ AI usage logs (cost tracking)
- ✅ Refresh token management

---

## 🎯 What's Next?

1. **Implement Content Module**
   - Create, read, update, delete content
   - Save AI-generated content

2. **Add Social Accounts Module**
   - Connect Instagram, Facebook, etc.
   - Store access tokens

3. **Implement Scheduling**
   - Schedule content for posting
   - Auto-optimize posting times

4. **Add Publishing**
   - Publish to connected platforms
   - Track publishing status

5. **Build Analytics**
   - Track engagement metrics
   - Show performance insights

---

**🚀 Your Business Pro backend is ready to rock!**

Need help? Check the docs in `/docs` or review `/api/README.md`
