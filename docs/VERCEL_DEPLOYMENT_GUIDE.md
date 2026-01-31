# Vercel Deployment Guide - Business Pro

Complete guide for deploying the Business Pro monorepo (Frontend + Backend) to Vercel.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Frontend Deployment (Next.js)](#frontend-deployment-nextjs)
- [Backend Deployment (NestJS API)](#backend-deployment-nestjs-api)
- [Common Issues & Fixes](#common-issues--fixes)
- [Environment Variables](#environment-variables)

---

## Overview

Business Pro is a monorepo containing:
- **Frontend**: `our-app/` - Next.js application
- **Backend**: `api/` - NestJS API
- **Shared Packages**: `packages/` - Shared utilities and types

Both can be deployed separately on Vercel for free.

---

## Prerequisites

1. **GitHub Repository**: Code must be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: PostgreSQL database (we use NeonDB)
4. **Git Configuration**: Ensure your git email matches your Vercel account

Check your git config:
```bash
git config --global user.email "your-vercel-email@example.com"
git config --global user.name "Your Name"
```

---

## Frontend Deployment (Next.js)

### Step 1: Create New Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Project Name**: `business-pro` (or any name)

### Step 2: Configure Settings

**Root Directory**: `our-app`

**Build & Development Settings**:
- Framework Preset: **Next.js** (auto-detected)
- Build Command: `bun run build`
- Output Directory: `.next`
- Install Command: `cd .. && bun install`

### Step 3: Environment Variables

Add these variables:
```
NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app
```

### Step 4: Deploy
Click **Deploy** and wait 2-3 minutes.

### ✅ Success
Your frontend will be live at: `https://your-project.vercel.app`

---

## Backend Deployment (NestJS API)

### Step 1: Create New Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same GitHub repository** again
3. **Project Name**: `business-pro-api`

### Step 2: Configure Settings

**Root Directory**: `api`

**Build & Development Settings**:
- Framework Preset: **Other** (NOT NestJS, NOT Next.js)
- Build Command: Leave empty or default
- Output Directory: Leave default
- Install Command: `cd .. && bun install`

### Step 3: Required Files

Ensure these files exist in your `api/` folder:

**`api/vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE", "HEAD"]
    }
  ]
}
```

**`api/package.json`** must include:
```json
{
  "dependencies": {
    "@nestjs/platform-express": "^11.0.1",
    "express": "^4.18.2",
    // ... other dependencies
  }
}
```

### Step 4: Environment Variables

Add ALL environment variables from your `api/.env`:

```bash
NODE_ENV=production
PORT=8000
API_PREFIX=api/v1
USE_REMOTE_DB=true

# Database
DATABASE_HOST=your-neon-host.neon.tech
DATABASE_PORT=5432
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name

DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
DB_LOGGING=false

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

# AI Gateway
AI_GATEWAY_API_KEY=your-vercel-ai-gateway-key
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_GATEWAY_NAME=businesspro-ai

# CORS (use your frontend URL)
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# Limits
RATE_LIMIT_TTL=3600
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10485760
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Step 5: Deploy
Click **Deploy** and wait 2-3 minutes.

### Step 6: Update Frontend
After API deployment:
1. Copy your API URL (e.g., `https://business-pro-api.vercel.app`)
2. Go to Frontend project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your API URL
4. Redeploy frontend

### ✅ Success
Your API will be live at: `https://your-api.vercel.app/api/v1`

**Note**: Swagger docs are disabled in production for serverless compatibility.

---

## Common Issues & Fixes

### 1. "Cannot find module 'express'"
**Fix**: Add `express` to `api/package.json` dependencies:
```json
"express": "^4.18.2"
```

### 2. "Cannot use import statement outside a module"
**Fix**: Ensure `vercel.json` points to `src/main.ts`, not a custom wrapper.

### 3. "@businesspro/ai not found" (Workspace Dependency)
**Fix**: 
- Option A: Remove workspace dependency and inline types
- Option B: Build shared package first in build command

### 4. "Deployment request did not have a git author"
**Fix**: Check git config matches Vercel account email:
```bash
git config --global user.email "your-vercel-email@example.com"
```

### 5. Frontend builds wrong package
**Fix**: Set **Root Directory** to `our-app` in project settings.

### 6. API builds as Next.js
**Fix**: 
1. Set **Root Directory** to `api`
2. Set **Framework Preset** to **Other**

### 7. Serverless function crashes
**Causes**:
- Database connection issues
- Missing environment variables
- CORS misconfiguration
- Native dependencies (use pure JS alternatives)

**Fix**: Check Runtime Logs in Vercel Dashboard for specific error.

### 8. TypeScript build errors with workspace packages
**Fix**: Use monorepo-aware install command:
```bash
cd .. && bun install
```

---

## Environment Variables

### Frontend Variables
```
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### Backend Variables
Required environment variables are listed in [Step 4 of Backend Deployment](#step-4-environment-variables).

**Security Notes**:
- Never commit `.env` files
- Use different secrets for production
- Rotate JWT secrets regularly
- Use Vercel's encrypted environment variables

---

## Project Structure

```
BusinessPro/
├── our-app/              # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── next.config.mjs
│
├── api/                  # Backend (NestJS)
│   ├── src/
│   │   └── main.ts       # Entry point for Vercel
│   ├── vercel.json       # Vercel configuration
│   └── package.json
│
├── packages/             # Shared packages
│   ├── ai/
│   ├── api-client/
│   └── auth-ui/
│
└── package.json          # Root workspace config
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Database accessible from internet
- [ ] Environment variables prepared
- [ ] Git email matches Vercel account

### Frontend
- [ ] Root Directory: `our-app`
- [ ] Framework: Next.js
- [ ] Install Command: `cd .. && bun install`
- [ ] Environment variable: `NEXT_PUBLIC_API_URL`

### Backend
- [ ] Root Directory: `api`
- [ ] Framework: Other
- [ ] Install Command: `cd .. && bun install`
- [ ] `vercel.json` exists and correct
- [ ] All environment variables added
- [ ] CORS_ORIGIN includes frontend URL

### Post-Deployment
- [ ] Test API endpoints
- [ ] Update frontend with API URL
- [ ] Verify database connections
- [ ] Test authentication flow

---

## Testing Deployments

### Frontend
Visit: `https://your-frontend.vercel.app`

### Backend
Test these endpoints:
- `https://your-api.vercel.app/api/v1` - Should return 404 or route info
- `https://your-api.vercel.app/api/v1/auth/login` - Should be accessible
- `https://your-api.vercel.app/api/v1/users/profile` - Should require auth

**Swagger Docs**: Disabled in production (use Postman or API client instead)

---

## Monorepo Best Practices

1. **Separate Projects**: Deploy frontend and backend as separate Vercel projects
2. **Root Directory**: Always set the correct root directory for each project
3. **Install Command**: Use `cd .. && bun install` to install from monorepo root
4. **Shared Packages**: Either inline or build them first
5. **Environment Variables**: Keep them separate per project
6. **CORS**: Always configure CORS to allow your frontend domain

---

## Alternative: Railway for Backend

If NestJS on Vercel continues to have issues, consider **Railway** for the backend:

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select `api` folder as root
4. Add environment variables
5. Deploy

Railway is better for persistent Node.js applications and databases.

---

## Support & Resources

- [Vercel NestJS Docs](https://vercel.com/docs/frameworks/backend/nestjs)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Changelog

- **2026-01-31**: Initial deployment guide created
- Documented monorepo deployment process
- Added common issues and fixes
- Added troubleshooting section

---

**Last Updated**: January 31, 2026
**Deployment Status**: ✅ Working
