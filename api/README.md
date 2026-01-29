# Business Pro - Backend API

NestJS backend for Business Pro social media automation platform.

## Features

✅ **Perfect Authentication System**
- Email/Password registration & login
- JWT access tokens (15min) + Refresh tokens (7 days)
- Protected routes by default (use @Public() for public endpoints)
- Token refresh mechanism
- Secure password hashing (bcrypt)

✅ **Vercel AI Gateway Integration**
- Centralized AI access through `@businesspro/ai` package
- Enum-based model selection (easy switching)
- Comprehensive AI usage logging
- Cost tracking (low/medium/high buckets)

✅ **Database - PostgreSQL**
- TypeORM for ORM
- Database: `businesspro` (local)
- Auto-sync in development
- Proper entity relationships
- Soft deletes where appropriate

✅ **Domain-Driven Architecture**
- Modular structure
- Each module owns its entities, services, controllers, DTOs
- Clean separation of concerns

## Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL 14+
- pnpm (or npm/yarn)

## Installation

1. **Install Dependencies** (from project root):
```powershell
cd api
pnpm install
```

2. **Setup Database**:
```powershell
# Create database
psql -U postgres
CREATE DATABASE businesspro;
\q
```

3. **Environment Variables**:
```powershell
# .env file is already configured with:
# - Database connection (localhost, port 5432, db: businesspro)
# - JWT secrets
# - AI Gateway API key
# - CORS settings

# No changes needed unless you have custom database settings
```

4. **Build AI Package**:
```powershell
# From project root
cd packages/ai
pnpm install
pnpm run build
```

5. **Start Development Server**:
```powershell
cd api
pnpm run start:dev
```

Server will start on: `http://localhost:3000/api/v1`

## Project Structure

```
api/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── decorators/          # @Public(), @CurrentUser()
│   │   ├── dto/                 # Register, Login DTOs
│   │   ├── entities/            # RefreshToken entity
│   │   ├── guards/              # JWT & Local guards
│   │   ├── strategies/          # JWT & Local strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                   # Users module
│   │   ├── entities/            # User entity
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── ai/                      # AI module
│   │   ├── entities/            # AILog entity
│   │   ├── ai.controller.ts     # AI endpoints
│   │   ├── ai.service.ts        # AI Gateway integration
│   │   └── ai.module.ts
│   │
│   ├── organizations/           # Organizations (multi-tenant)
│   │   ├── entities/
│   │   └── ...
│   │
│   ├── content/                 # Content management (TODO)
│   │   ├── entities/            # Content entity
│   │   └── ...
│   │
│   ├── config/                  # Configuration files
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── ai.config.ts
│   │
│   ├── common/                  # Shared code
│   │   ├── enums/               # Business enums
│   │   └── ...
│   │
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Bootstrap
│
├── .env                         # Environment variables
├── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (get access + refresh tokens)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (revoke refresh tokens)
- `GET /api/v1/auth/me` - Get current user

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update profile
- `DELETE /api/v1/users/account` - Delete account

### AI Generation

- `POST /api/v1/ai/generate/ideas` - Generate 5 content ideas
- `POST /api/v1/ai/generate/caption` - Generate caption
- `POST /api/v1/ai/generate/hooks` - Generate hooks
- `POST /api/v1/ai/generate/hashtags` - Generate hashtags
- `GET /api/v1/ai/suggestions` - Get AI suggestions

### Content (TODO)

- `GET /api/v1/content` - List content
- `POST /api/v1/content` - Create content
- `PATCH /api/v1/content/:id` - Update content
- `DELETE /api/v1/content/:id` - Delete content

**Full API documentation**: See `/docs/API_ENDPOINTS.md`

## Testing the API

### 1. Register a User
```powershell
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@example.com\",
    \"password\": \"Password123!\",
    \"name\": \"Test Business\",
    \"businessType\": \"cafe\"
  }'
```

### 2. Login
```powershell
curl -X POST http://localhost:3000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@example.com\",
    \"password\": \"Password123!\"
  }'
```

Save the `accessToken` from the response.

### 3. Get Current User
```powershell
curl -X GET http://localhost:3000/api/v1/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Generate AI Content Ideas
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

## Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=businesspro
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# AI Gateway
AI_GATEWAY_API_KEY=vck_1EXBkRPkJSsc3BOptr7dAGVvJE4IXfAXdU5s8yR1bc45ZEgvi53wxtil
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
```

## Development

### Watch Mode
```powershell
pnpm run start:dev
```

### Build
```powershell
pnpm run build
```

### Production
```powershell
pnpm run start:prod
```

### Linting
```powershell
pnpm run lint
```

### Testing
```powershell
pnpm run test        # Unit tests
pnpm run test:e2e    # E2E tests
pnpm run test:cov    # Coverage
```

## Database Management

### Synchronize Schema (Development Only)
TypeORM auto-syncs in development mode. In production, use migrations.

### View Database
```powershell
psql -U postgres -d businesspro

# List tables
\dt

# View users
SELECT * FROM users;

# View AI logs
SELECT * FROM ai_logs ORDER BY created_at DESC LIMIT 10;
```

### Reset Database
```powershell
psql -U postgres
DROP DATABASE businesspro;
CREATE DATABASE businesspro;
\q
```

## AI Gateway Usage

### How AI Integration Works

1. **All AI requests go through `@businesspro/ai` package**
2. **Model selection via enums** (defined in `packages/ai/src/types/index.ts`)
3. **Automatic logging** to `ai_logs` table for cost tracking
4. **Cost buckets** automatically assigned based on model type

### Switching AI Models

To switch models globally:

```typescript
// packages/ai/src/types/index.ts
export enum AIModel {
  HEAVY_MODEL = 'anthropic:claude-3-5-sonnet-20241022', // Changed!
  LIGHT_MODEL = 'openai:gpt-4o-mini',
  VISION_MODEL = 'openai:gpt-4o',
}
```

That's it! All features using `AIModel.HEAVY_MODEL` will now use Claude.

### AI Cost Tracking

All AI requests are logged in `ai_logs` table with:
- Feature used
- Model enum
- Provider & model name
- Token usage
- Cost bucket (low/medium/high)
- Duration
- Sanitized input/output

Query AI usage:
```sql
SELECT 
  feature,
  model_enum,
  cost_bucket,
  COUNT(*) as requests,
  SUM(total_tokens) as total_tokens
FROM ai_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY feature, model_enum, cost_bucket;
```

## Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with short expiry (15 min)
- ✅ Refresh token rotation
- ✅ Global route protection (JWT guard)
- ✅ Input validation (class-validator)
- ✅ CORS enabled
- ✅ Rate limiting (100 req/min)
- ✅ SQL injection protection (TypeORM parameterized queries)

## Next Steps

### Implement Remaining Modules

1. **Content Module** - CRUD for content
2. **Scheduling Module** - Content scheduling
3. **Social Accounts Module** - Connect social platforms
4. **Publishing Module** - Publish to platforms
5. **Analytics Module** - Track performance
6. **Webhooks Module** - Platform webhooks

### Add Features

- [ ] Email verification
- [ ] Password reset flow
- [ ] User profile image upload
- [ ] Content image generation (AI)
- [ ] Scheduled jobs (cron)
- [ ] WebSocket for real-time updates
- [ ] Swagger/OpenAPI documentation
- [ ] API versioning
- [ ] Admin panel endpoints
- [ ] Multi-organization support

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Start PostgreSQL service
```powershell
# Check if PostgreSQL is running
Get-Service -Name "postgresql*"

# Start if not running
Start-Service -Name "postgresql-x64-14"  # Adjust version
```

### AI Gateway Error
```
Error: AI_GATEWAY_API_KEY is not configured
```
**Solution**: Ensure `.env` file has `AI_GATEWAY_API_KEY` set

### Module Not Found: @businesspro/ai
**Solution**: Build the AI package first
```powershell
cd packages/ai
pnpm run build
cd ../../api
```

## Scripts

Available npm scripts:

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Business Pro Docs](/docs/)

## License

Private - Business Pro © 2026
