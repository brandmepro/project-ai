# Vercel Monorepo Deployment - Quick Reference

## 📋 Deployment Checklist

Before deploying to Vercel, ensure:

- ✅ All workspace packages build successfully locally
- ✅ `vercel.json` has correct `installCommand` and `buildCommand`
- ✅ TypeScript compiles without errors
- ✅ Type imports use `type` keyword for type-only imports

---

## 🏗️ Monorepo Build Configuration

### Required Setup in `api/vercel.json`:

```json
{
  "installCommand": "cd .. && bun install",
  "buildCommand": "cd .. && bun run build:ai && cd api && bun run build"
}
```

### Why This Matters:

| Command | Purpose | Result |
|---------|---------|--------|
| `cd ..` | Navigate to monorepo root | Enables workspace awareness |
| `bun install` | Install all dependencies | Links workspace packages |
| `bun run build:ai` | Build @businesspro/ai | Makes package available to API |
| `cd api && bun run build` | Build API | Uses built workspace packages |

---

## 🔧 TypeScript Configuration

### Required in `api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node", "express"],
    "typeRoots": ["./node_modules/@types", "../node_modules/@types"]
  }
}
```

### Common TypeScript Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| Property 'url' does not exist on type 'Request' | Missing Express types | Add `"express"` to `types` array |
| Cannot find module '@businesspro/ai' | Package not built | Build workspace packages first |
| Property 'name' does not exist on type 'Profile' | Wrong destructuring | Use optional chaining: `profile.name?.givenName` |

---

## 📝 Best Practices

### 1. Type Imports

**✅ DO:**
```typescript
import type { Request, Response } from 'express';
```

**❌ DON'T:**
```typescript
import { Request, Response } from 'express';
```

### 2. Optional Chaining

**✅ DO:**
```typescript
const value = profile.name?.givenName || '';
const photo = photos?.[0]?.value || '';
```

**❌ DON'T:**
```typescript
const value = profile.name.givenName;
const photo = photos[0].value;
```

### 3. Workspace Dependencies

**✅ DO:**
```bash
# Build dependencies first
bun run build:ai
bun run build:auth-ui
bun run build:api
```

**❌ DON'T:**
```bash
# Don't build API without dependencies
cd api && bun run build
```

---

## 🚀 Local Testing Before Deploy

```powershell
# 1. Clean build
cd D:\Projects\BusinessPro
Remove-Item -Recurse -Force api\dist, packages\ai\dist

# 2. Build in correct order
bun run build:ai
bun run build:api

# 3. Check for TypeScript errors
cd api
bun run build

# 4. If successful, deploy
git add .
git commit -m "fix: resolve TypeScript build errors"
git push origin main
```

---

## 🔍 Debugging Deployment Failures

### Check Build Logs

1. Go to Vercel dashboard
2. Click on failed deployment
3. Check "Building" section for errors

### Common Issues:

**Issue:** `Cannot find module '@businesspro/ai'`
- **Cause:** Workspace package not built
- **Fix:** Verify `buildCommand` builds dependencies first

**Issue:** `Property 'X' does not exist on type 'Request'`
- **Cause:** Missing type definitions
- **Fix:** Add to `types` array in tsconfig.json

**Issue:** `Module not found: Can't resolve 'express'`
- **Cause:** Dependencies not installed from root
- **Fix:** Set `installCommand: "cd .. && bun install"`

---

## 📚 Useful Commands

```powershell
# View TypeScript errors without building
cd api
bunx tsc --noEmit

# Build all packages in order
cd ..
bun run build

# Deploy to Vercel
vercel --prod

# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

---

## 🎯 Quick Fixes

### Add New Workspace Package

1. Create package in `/packages/new-package`
2. Add to root `package.json` workspaces
3. Add build script to `buildCommand`:
   ```json
   "buildCommand": "cd .. && bun run build:new-package && bun run build:ai && cd api && bun run build"
   ```

### Add New Type Definition

1. Install types: `bun add -D @types/package-name`
2. Add to tsconfig.json `types` array:
   ```json
   "types": ["node", "express", "package-name"]
   ```

---

## ⚠️ Things to Avoid

1. ❌ **Never** build API without building workspace dependencies first
2. ❌ **Never** use direct imports for type-only imports
3. ❌ **Never** access nested object properties without optional chaining
4. ❌ **Never** assume Vercel will automatically handle workspace builds

---

## ✅ Success Indicators

Deployment is successful when:

- ✅ Build logs show "Build Completed in /vercel/output"
- ✅ No TypeScript compilation errors
- ✅ All workspace packages built successfully
- ✅ Deployment shows "Ready" status

---

**Last Updated:** February 16, 2026  
**Monorepo Structure:** Bun workspaces  
**Package Manager:** Bun 1.3.6+  
**TypeScript:** 5.9.3+
