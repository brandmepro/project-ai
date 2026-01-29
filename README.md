# Business Pro - AI-Driven Social Media Automation

**Mobile-first, AI-driven SaaS platform** for automatically running social media marketing for local businesses in India.

---

## 🚀 Quick Start

### 1. Install (Root Level)
```powershell
bun install
```

### 2. Build AI Package
```powershell
bun run build:ai
```

### 3. Setup Database
```powershell
# Create database
psql -U postgres
CREATE DATABASE businesspro;
\q

# Seed enhanced AI models (see docs/DATABASE_SCHEMA_ENHANCED.md)
```

### 4. Start Dev Servers
```powershell
pnpm dev     # Starts both frontend & backend
```

**Frontend**: http://localhost:3001  
**Backend API**: http://localhost:3000/api/v1

---

## 📦 Monorepo Structure

```
BusinessPro/
├── our-app/              # Next.js frontend
├── api/                  # NestJS backend
├── packages/ai/          # AI Gateway package
└── docs/                 # Documentation
```

**Single node_modules** at root for unified dependency management.

---

## 🎯 Available Scripts

```bash
bun dev               # Start both FE + BE
bun dev:api           # Backend only
bun dev:web           # Frontend only

bun build             # Build all
bun build:ai          # Build AI package
bun build:api         # Build backend
bun build:web         # Build frontend

bun lint              # Lint all
bun format            # Format all files

bun test              # Run tests

# Database Migrations
bun migration:generate -- MigrationName
bun migration:run
bun migration:revert

bun clean             # Clean everything
```

---

## ✨ Key Features

### 1. Perfect Authentication
- Email/password with JWT
- Access tokens (15min) + Refresh tokens (7 days)
- Global route protection

### 2. Intelligent AI Model Management
- **Automatic model selection** based on task type
- **User preference learning** from feedback (like/dislike/regenerate)
- **Multi-provider support** (OpenAI, Anthropic, Google, etc.)
- **Task categorization** (text, image, video generation)
- **Performance tracking** across all models

### 3. Task-Based AI Generation
```typescript
// Frontend can request any task
POST /api/v1/ai/generate/task
{
  "category": "content_caption",    // What to generate
  "priority": "speed",               // speed | balanced | quality
  "complexity": "simple",            // simple | moderate | complex
  "prompt": "Generate caption...",
  "userPreferenceWeight": 0.3        // Learn from past feedback
}

// Backend automatically:
// 1. Selects best model for the task
// 2. Considers user's past feedback
// 3. Optimizes for speed vs quality
// 4. Generates content
// 5. Logs everything for learning
```

### 4. User Feedback Loop
```typescript
// User likes/dislikes output
POST /api/v1/ai/feedback
{
  "aiLogId": "uuid",
  "modelId": "openai:gpt-4o-mini",
  "category": "content_caption",
  "feedbackType": "like",           // like | dislike | regenerate | skip
  "qualityRating": 5                // 1-5 stars
}

// System learns and improves future selections
```

---

## 🗄️ Database Tables

### Core
- `users` - User accounts
- `organizations` - Multi-tenant businesses
- `content` - Generated content
- `refresh_tokens` - JWT management

### Intelligent AI (New!)
- `ai_models` - Complete model catalog
- `ai_task_categories` - Task definitions
- `ai_model_task_mappings` - Model-task suitability scores
- `ai_user_preferences` - User's model preferences per task
- `ai_user_feedback` - Individual feedback entries
- `ai_model_performance_aggregates` - Performance statistics
- `ai_logs` - Usage logs with task tracking

---

## 🎨 Task Categories

| Category | Description | Best Model | Cost |
|----------|-------------|------------|------|
| `content_caption` | Social media captions | GPT-4 Mini | Low |
| `content_hooks` | Attention-grabbing hooks | GPT-4 Mini | Low |
| `content_hashtags` | SEO hashtags | GPT-4 Mini | Low |
| `content_ideas` | Content storylines | GPT-4 / Claude | High |
| `content_script` | Video/reel scripts | GPT-4 / Gemini | Med |
| `image_social` | Social media graphics | DALL-E 3 / SD3 | High |
| `video_short` | Short video clips | Sora / Runway | High |
| `analysis_engagement` | Engagement prediction | GPT-4 / Claude | Med |

---

## 📊 How Model Selection Works

### Scoring Algorithm
```
Total = 100 points

20 pts - Model Quality & Reliability
30 pts - Task Suitability (required capabilities)
20 pts - Priority Alignment (speed vs quality)
15 pts - Complexity Handling
15 pts - User Preference (from past feedback)
 5 pts - Recommended Bonus
```

### Example: Caption Generation (simple, speed priority)

**GPT-4 Mini**: 100 points ← **Selected!**
- ✅ Fast response time
- ✅ Low cost
- ✅ Well-suited for captions
- ✅ User liked it before

**GPT-4**: 90 points
- ❌ Slower
- ❌ More expensive
- ✅ Higher quality (not needed for simple task)

---

## 🔄 Learning Loop

```
1. User requests generation
   ↓
2. System selects best model (considers past feedback)
   ↓
3. Generate content with selected model
   ↓
4. User provides feedback (like/dislike/regenerate)
   ↓
5. System updates preferences & performance stats
   ↓
6. Next time: Smarter model selection!
```

**Result**: System gets better at picking models over time.

---

## 📚 Documentation

- **Setup Summary**: `/docs/SETUP_SUMMARY.md` ← Start here!
- **Enhanced AI Guide**: `/docs/ENHANCED_AI_SETUP.md`
- **Database Schema**: `/docs/DATABASE_SCHEMA_ENHANCED.md`
- **API Endpoints**: `/docs/API_ENDPOINTS.md`
- **Quick Start**: `/QUICKSTART.md`
- **Product Context**: `/docs/memory-bank/CONTEXT.md`

---

## 🛠️ Tech Stack

**Frontend**:
- Next.js 16
- React 19
- Mantine UI + Tailwind
- Framer Motion
- Zustand (state)

**Backend**:
- NestJS 11
- TypeORM
- PostgreSQL
- JWT Auth
- Passport

**AI**:
- Vercel AI SDK
- Custom Gateway package (`@businesspro/ai`)
- Multi-provider support

**Monorepo**:
- pnpm workspaces
- Unified dependency management
- Concurrent dev servers

---

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Current user

### AI Generation (Legacy)
- `POST /ai/generate/ideas` - Generate content ideas
- `POST /ai/generate/caption` - Generate captions
- `POST /ai/generate/hooks` - Generate hooks
- `POST /ai/generate/hashtags` - Generate hashtags

### AI Generation (New - Intelligent!)
- `POST /ai/generate/task` - Task-based generation
- `POST /ai/select-model` - Get best model for task
- `GET /ai/models/:category` - Available models
- `POST /ai/feedback` - Submit feedback
- `GET /ai/preferences/:category` - User's top models
- `GET /ai/stats/:modelId/:category` - Model statistics

---

## 🔑 Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=businesspro
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# AI Gateway
AI_GATEWAY_API_KEY=vck_1EXBkRPkJSsc3BOptr7dAGVvJE4IXfAXdU5s8yR1bc45ZEgvi53wxtil
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
```

---

## 🧪 Testing

### Test Authentication
```powershell
# Register
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@cafe.com","password":"SecurePass123!","name":"My Cafe","businessType":"cafe"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@cafe.com","password":"SecurePass123!"}'
```

### Test AI Generation (Intelligent)
```powershell
curl -X POST http://localhost:3000/api/v1/ai/generate/task `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"category\":\"content_caption\",
    \"priority\":\"speed\",
    \"prompt\":\"Generate caption for morning coffee special\",
    \"maxTokens\":300
  }'
```

### Submit Feedback
```powershell
curl -X POST http://localhost:3000/api/v1/ai/feedback `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"aiLogId\":\"uuid-from-generation\",
    \"modelId\":\"openai:gpt-4o-mini\",
    \"category\":\"content_caption\",
    \"feedbackType\":\"like\",
    \"qualityRating\":5
  }'
```

---

## 🐛 Troubleshooting

### PostgreSQL not running
```powershell
Get-Service -Name "postgresql*"
Start-Service -Name "postgresql-x64-14"
```

### Module @businesspro/ai not found
```powershell
pnpm build:ai
```

### Port already in use
Edit `api/.env`:
```env
PORT=3001
```

---

## 📈 Roadmap

### Phase 1: MVP ✅
- ✅ Authentication system
- ✅ Basic AI generation
- ✅ Database setup

### Phase 2: Intelligence ✅
- ✅ Task-based model selection
- ✅ User preference learning
- ✅ Feedback system
- ✅ Performance tracking

### Phase 3: Content Management (Next)
- [ ] Content CRUD
- [ ] Social account connections
- [ ] Scheduling system
- [ ] Publishing to platforms

### Phase 4: Analytics & Insights
- [ ] Engagement tracking
- [ ] Performance analytics
- [ ] Trend analysis
- [ ] Recommendations

---

## 🤝 Contributing

This is a private project for Business Pro. See `/docs/memory-bank/CONTEXT.md` for product vision and constraints.

---

## 📄 License

Private - Business Pro © 2026

---

## 🎉 Summary

**You have a production-ready backend with:**

✅ Monorepo with unified dependencies  
✅ Perfect email/password authentication  
✅ **Intelligent AI that learns from users**  
✅ **Automatic model selection for any task**  
✅ Multi-provider AI support (OpenAI, Anthropic, Google)  
✅ Complete database schema for AI management  
✅ User feedback & preference learning  
✅ Performance tracking & optimization  
✅ Clean npm scripts for all operations  
✅ Comprehensive documentation  

**Your system gets smarter with every user interaction! 🚀**
