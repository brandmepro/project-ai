# Railway Deployment Guide — NestJS API (Bun Monorepo)

> Reference this doc whenever deploying or debugging the backend on Railway.
> Built from real lessons — every section here was a real problem we solved.

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [Dockerfile — How It Works](#2-dockerfile--how-it-works)
3. [Railway Settings (Exact Configuration)](#3-railway-settings-exact-configuration)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Database — Supabase Setup](#5-database--supabase-setup)
6. [TypeORM Migrations vs Synchronize](#6-typeorm-migrations-vs-synchronize)
7. [Local Development Setup](#7-local-development-setup)
8. [Common Errors & Fixes](#8-common-errors--fixes)
9. [Deployment Checklist](#9-deployment-checklist)

---

## 1. Project Structure Overview

```
BusinessPro/                  ← monorepo root
├── Dockerfile                ← used by Railway (DO NOT move or rename)
├── .dockerignore             ← keeps image lean
├── railway.toml              ← minimal config (restart policy only)
├── package.json              ← bun workspaces: api, packages/*, our-app
├── bun.lock                  ← lockfile (must be committed)
├── api/                      ← NestJS backend
│   ├── .env                  ← local dev env (never commit secrets)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.config.ts
│   │   └── database/
│   │       ├── data-source.ts
│   │       └── migrations/
├── packages/
│   ├── ai/                   ← @businesspro/ai (API depends on this)
│   ├── auth-ui/
│   ├── api-client/
│   └── shared-utils/
└── our-app/                  ← Next.js frontend (excluded from Docker build)
```

---

## 2. Dockerfile — How It Works

The `Dockerfile` at the repo root uses a **2-stage build**:

### Stage 1: `builder` (oven/bun:1)
- Copies ALL workspace `package.json` stubs (required by bun workspace resolver)
- Runs `bun install --frozen-lockfile` to install all deps into root `node_modules`
- Copies source for `packages/ai` and `api` only
- Builds `packages/ai` first (API depends on it)
- Builds the NestJS API (`nest build` → `api/dist/`)

### Stage 2: `runner` (node:20-alpine)
- Lean production image — **no bun installed**
- Copies only: `api/dist`, `node_modules`, `packages/ai/dist`, package.json files
- Starts with `node api/dist/main`

### Critical rules about the Dockerfile:
- **All workspace `package.json` files must be copied** before `bun install`, even for packages not used in the build (our-app, auth-ui, api-client, shared-utils). Bun's workspace resolver requires them all to exist.
- The runner uses `node`, not `bun` — never set a start command that uses `bun` in Railway.
- `EXPOSE 8000` is documentation only; Railway routes via the `PORT` env var it injects.

```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* bunfig.toml ./
COPY api/package.json ./api/
COPY packages/ai/package.json ./packages/ai/
COPY packages/auth-ui/package.json ./packages/auth-ui/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY our-app/package.json ./our-app/          # ← needed for workspace resolution

RUN bun install --frozen-lockfile

COPY packages/ai/ ./packages/ai/
COPY api/ ./api/

RUN bun run build:ai
RUN cd api && bun run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/packages/ai/package.json ./packages/ai/package.json
COPY --from=builder /app/api/package.json ./api/package.json

EXPOSE 8000
CMD ["node", "api/dist/main"]
```

### .dockerignore rules:
```
our-app
!our-app/package.json     ← must negate to allow package.json through
```
If a new workspace is added, add its `package.json` copy line to the Dockerfile AND unblock it in `.dockerignore` if needed.

---

## 3. Railway Settings (Exact Configuration)

| Setting | Value |
|---|---|
| **Source Repo** | `brandmepro/project-ai` |
| **Branch** | `main` |
| **Builder** | Dockerfile |
| **Dockerfile Path** | `/Dockerfile` |
| **Custom Build Command** | *(empty — Dockerfile handles everything)* |
| **Custom Start Command** | *(empty — Dockerfile CMD handles it)* |
| **Watch Paths** | `/api/**` and `/packages/ai/**` |
| **Healthcheck Path** | `/api/v1/health` |
| **Healthcheck Timeout** | `300` |
| **Restart Policy** | On Failure, max 10 retries |

### Public Networking:
- Go to **Settings → Networking → Generate Domain** to get the `*.up.railway.app` URL.
- Without clicking Generate Domain, the URL will not resolve (DNS_PROBE_FINISHED_NXDOMAIN).

### Auto-deploy:
- Every `git push` to `main` automatically triggers a redeploy.
- Watch Paths ensure only API-related changes trigger a rebuild (frontend pushes are ignored).

---

## 4. Environment Variables Reference

Set these in Railway → **Variables** tab. Do NOT set local-only variables.

### Required in Railway:

```env
NODE_ENV=production
API_PREFIX=api/v1

# Do NOT set PORT — Railway injects it automatically

# Database
USE_REMOTE_DB=true
SUPABASE_DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
DB_LOGGING=false

# JWT
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_REFRESH_EXPIRES_IN=7d

# AI Gateway
AI_GATEWAY_API_KEY=<your-key>
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_GATEWAY_NAME=business-pro

# CORS (comma-separated frontend URLs)
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3001

# Backend URL (your Railway URL)
BACKEND_URL=https://api-production-XXXX.up.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-secret>
GOOGLE_CALLBACK_URL=/api/v1/auth/google/callback

# Other
ENCRYPTION_KEY=<32-char-key>
```

### Do NOT set in Railway:
- `PORT` — Railway injects this dynamically. Hardcoding it can break routing.
- `LOCAL_DATABASE_*` — dev-only variables, not needed in production.

---

## 5. Database — Supabase Setup

### Connection URL (Session Pooler — IPv4 + IPv6 compatible):
```
postgresql://postgres.<project-ref>:<password>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

Get this from: **Supabase Dashboard → Project → Connect → Session Pooler**

### Why Session Pooler (not Direct Connection):
- Direct connection (`db.<ref>.supabase.co:5432`) is **IPv6 only** — won't work on IPv4 networks or Railway.
- Session Pooler works on both IPv4 and IPv6.
- Transaction Pooler (port 6543) does NOT support DDL or prepared statements — never use it with TypeORM.

### SSL Config (required for Supabase):
In `database.config.ts`:
```typescript
ssl: { rejectUnauthorized: false }
```

### Schema:
Always specify `schema: 'public'` explicitly in the TypeORM config to avoid search_path issues.

---

## 6. TypeORM Migrations vs Synchronize

### Rule: NEVER use `synchronize: true` with Supabase

`synchronize: true` sends DDL queries via `information_schema` introspection.
The Session Pooler (PgBouncer) doesn't reliably propagate `search_path` state across pooled connections — TypeORM silently skips table creation.

**Always use migrations:**

```env
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true    # runs pending migrations automatically on startup
```

With `DB_MIGRATIONS_RUN=true`, TypeORM checks the `migrations` table on startup and runs any pending migrations automatically — same auto-behaviour as synchronize but fully reliable.

### Running migrations locally:
```powershell
# From api/ directory
bun run migration:run        # runs pending migrations against Supabase
bun run migration:revert     # reverts last migration
bun run migration:show       # lists all migrations and their status
```

### Creating a new migration:
```powershell
# From api/ directory
bun run migration:generate -- -n YourMigrationName
```
Then commit the generated file — it runs automatically on next deploy.

### Migration scripts use `bun --env-file=.env`:
In `api/package.json`:
```json
"migration:run": "bun --env-file=.env typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts"
```
This loads `api/.env` before TypeORM CLI runs, ensuring the correct DB URL is used.

---

## 7. Local Development Setup

### Start the API locally:
```powershell
# From monorepo root:
bun run dev:api

# OR from api/ directory:
bun run start:dev
```

### The `start:dev` script uses bun `--env-file`:
```json
"start:dev": "bun --env-file=.env x nest start --watch"
```

This is critical — it loads `api/.env` **before** NestJS starts, ensuring `DB_SYNCHRONIZE`, `DB_MIGRATIONS_RUN`, and all other vars are in `process.env` when TypeORM initializes. Without `--env-file`, env vars may not load correctly in a monorepo context.

### Switching between local and remote DB:
```env
USE_REMOTE_DB=false   # uses LOCAL_DATABASE_* variables → local PostgreSQL
USE_REMOTE_DB=true    # uses SUPABASE_DATABASE_URL → Supabase
```

### Local DB variables (keep in api/.env, never commit):
```env
LOCAL_DATABASE_HOST=localhost
LOCAL_DATABASE_PORT=5432
LOCAL_DATABASE_USER=postgres
LOCAL_DATABASE_PASSWORD=postgres
LOCAL_DATABASE_NAME=businesspro
```

---

## 8. Common Errors & Fixes

### `Workspace not found "our-app"` during Docker build
**Cause:** bun requires all workspace `package.json` files to exist before `bun install`.
**Fix:** Add `COPY our-app/package.json ./our-app/` to Dockerfile. Add `!our-app/package.json` negation to `.dockerignore`.

---

### `Workspace dependency "@businesspro/auth-ui" not found`
**Cause:** Same as above — missing `package.json` stubs for other packages.
**Fix:** Copy ALL workspace `package.json` files in the Dockerfile builder stage.

---

### `error deploying from source` with empty logs (Railpack)
**Cause:** Railpack (Railway's auto-detector) has a known bug with Bun monorepos — it looks for `bun.lock` in the service subdirectory, not the repo root.
**Fix:** Use a custom `Dockerfile` and set Builder to "Dockerfile" in Railway settings. Never use Railpack/Nixpacks for this monorepo.

---

### `Connection terminated due to connection timeout` (Supabase)
**Cause:** Using the direct Supabase connection URL which is IPv6-only.
**Fix:** Use the **Session Pooler** URL (`pooler.supabase.com:5432`), not the direct URL (`db.<ref>.supabase.co:5432`).

---

### `relation "public.users" does not exist`
**Cause:** Tables haven't been created in Supabase yet.
**Fix:** Set `DB_MIGRATIONS_RUN=true` and restart, OR run `bun run migration:run` from `api/`.

---

### `column "model_name" of relation "ai_models" does not exist`
**Cause:** Migration INSERT statements use column names that don't match the actual table schema.
**Fix:** Check the `CreateAITables` migration for actual column names and align the seed migration's INSERT/ON CONFLICT statements.

---

### `DB_SYNCHRONIZE` / `DB_MIGRATIONS_RUN` not applied on startup
**Cause:** `nest start --watch` doesn't load `.env` — NestJS `ConfigModule` may not find the file if CWD is the monorepo root.
**Fix:** Use `bun --env-file=.env x nest start --watch` as the start script. This loads `.env` before any module runs.

---

### `ReferenceError: Cannot access 'User' before initialization`
**Cause:** Running TypeScript directly with `bun --watch run src/main.ts` — Bun's module loader handles circular entity imports differently than Node.js/ts-node.
**Fix:** Use `bun --env-file=.env x nest start --watch` (runs the nest CLI via `bun x`, which uses Node.js/ts-node internally and handles circular deps).

---

### `bun: not found` on Railway startup
**Cause:** The runner stage uses `node:20-alpine` which has no bun. A start command like `bun run start:prod` will fail.
**Fix:** Leave the Custom Start Command empty — the Dockerfile `CMD ["node", "api/dist/main"]` handles it.

---

### `DNS_PROBE_FINISHED_NXDOMAIN` when accessing Railway URL
**Cause:** Public domain not generated, or DNS hasn't propagated yet.
**Fix:** Go to Railway → Settings → Networking → click **Generate Domain**. Wait 1–2 minutes for DNS to propagate.

---

### `DB: undefined` in startup logs
**Cause:** When connecting via URL (`SUPABASE_DATABASE_URL`), TypeORM sets `options.url` not `options.database`.
**Fix:** Parse DB name from URL: `opts.database || new URL(opts.url).pathname.replace('/', '')`.

---

## 9. Deployment Checklist

Before every deploy, verify:

- [ ] All new entities have a migration file in `api/src/database/migrations/`
- [ ] Migration file is committed and pushed
- [ ] `DB_SYNCHRONIZE=false` and `DB_MIGRATIONS_RUN=true` in Railway Variables
- [ ] `PORT` is NOT set in Railway Variables (let Railway inject it)
- [ ] `SUPABASE_DATABASE_URL` uses the **Session Pooler** URL (port 5432, not 6543)
- [ ] `NODE_ENV=production` in Railway Variables
- [ ] `CORS_ORIGIN` includes all frontend URLs (comma-separated)
- [ ] `BACKEND_URL` is set to the Railway public domain
- [ ] Dockerfile `CMD` is `node api/dist/main` (no bun in runner stage)
- [ ] Custom Build Command and Custom Start Command are **empty** in Railway settings
- [ ] Push to `main` — Railway auto-deploys

### Verify deployment:
After deploy completes, hit the health endpoint:
```
GET https://<your-railway-url>/api/v1
```
Expected response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "type": "Supabase (Remote)",
    "database": "postgres"
  }
}
```

If `connected: false` or `status: "degraded"` — check Railway → Deploy Logs for TypeORM errors.
