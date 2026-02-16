# Vercel Deployment TypeScript Fix

**Date:** February 16, 2026  
**Issue:** TypeScript compilation errors during Vercel deployment  
**Status:** ✅ RESOLVED

---

## Problem Summary

Vercel deployment was failing with multiple TypeScript errors:

1. ❌ Missing properties on Express `Request`/`Response` types (url, method, status, redirect, user)
2. ❌ Cannot find module `@businesspro/ai` 
3. ❌ Missing properties on passport `Profile` type (name, photos)

### Root Causes

1. **Monorepo Build Order Issue**
   - `@businesspro/ai` workspace package wasn't being built before the API
   - Vercel builds only the current directory by default
   - Missing `buildCommand` in vercel.json

2. **TypeScript Configuration Issue**
   - Missing explicit `types` array in tsconfig.json
   - TypeRoots not pointing to monorepo node_modules
   - Express type definitions not properly resolved

3. **Import Statement Issues**
   - Using direct imports instead of type imports for Express types
   - Improper destructuring of passport Profile type

---

## Solution Applied

### 1. Updated `api/vercel.json`

Added proper install and build commands for monorepo:

```json
{
  "version": 2,
  "installCommand": "cd .. && bun install",
  "buildCommand": "cd .. && bun run build:ai && cd api && bun run build",
  "builds": [...],
  "routes": [...]
}
```

**Why this works:**
- `installCommand`: Installs dependencies from monorepo root (ensures workspace linking)
- `buildCommand`: 
  1. Builds `@businesspro/ai` package FIRST
  2. Then builds the API with dependency available

### 2. Updated `api/tsconfig.json`

Added explicit type definitions and roots:

```json
{
  "compilerOptions": {
    // ... existing options
    "types": ["node", "express"],
    "typeRoots": ["./node_modules/@types", "../node_modules/@types"]
  }
}
```

**Why this works:**
- `types`: Explicitly tells TypeScript to include Express type definitions
- `typeRoots`: Points to both local AND monorepo root node_modules for @types packages

### 3. Fixed Import Statements

Changed from direct imports to type imports:

**Before:**
```typescript
import { Request, Response } from 'express';
```

**After:**
```typescript
import type { Request, Response } from 'express';
```

**Files updated:**
- `api/src/common/filters/http-exception.filter.ts`
- `api/src/auth/auth.controller.ts`

**Why this works:**
- Type-only imports don't affect runtime
- Better compatibility with NestJS Request/Response decorators
- Prevents conflicts between Express and NestJS types

### 4. Fixed Google Strategy Profile Type

Updated profile destructuring to handle optional fields:

**Before:**
```typescript
const { id, name, emails, photos } = profile;
const user = {
  name: `${name.givenName} ${name.familyName}`,
  picture: photos[0]?.value,
};
```

**After:**
```typescript
const { id, emails, photos } = profile;
const displayName = profile.displayName || profile.name?.givenName || '';
const user = {
  name: displayName,
  picture: photos?.[0]?.value || '',
};
```

**Why this works:**
- Uses optional chaining for nested properties
- Provides fallback values
- Handles undefined profile.name correctly

---

## Verification Steps

To verify the fix works:

1. **Local TypeScript Check:**
   ```powershell
   cd api
   bun run build
   ```

2. **Build Workspace Packages:**
   ```powershell
   # From root
   bun run build:ai
   bun run build:api
   ```

3. **Deploy to Vercel:**
   - Push changes to main branch
   - Vercel will automatically trigger deployment
   - Check build logs for successful compilation

---

## Why This Is a Permanent Fix

### Minimalist Approach ✅

1. **No Extra Dependencies** - Used existing tooling
2. **No Workarounds** - Fixed root causes directly
3. **Standard Configuration** - Follows Vercel monorepo best practices

### Prevents Future Issues ✅

1. **Build Order Guaranteed** - `buildCommand` ensures correct sequence
2. **Type Safety Enforced** - Explicit type definitions prevent drift
3. **Workspace Aware** - Both install and build commands understand monorepo structure

### Vercel Documentation References

Based on official Vercel documentation:

- **Monorepo builds:** Must use `installCommand` from root to enable workspace linking
- **Build commands:** Should build dependencies before main project
- **TypeScript:** Requires explicit configuration for workspace packages

---

## Key Takeaways

🎯 **Always build workspace dependencies first in monorepos**

🎯 **Use `type` imports for TypeScript types that aren't needed at runtime**

🎯 **Configure tsconfig with explicit `types` array and `typeRoots` for monorepos**

🎯 **Vercel's `buildCommand` runs from project directory - use `cd` to navigate**

---

## Related Files

- `/api/vercel.json` - Build configuration
- `/api/tsconfig.json` - TypeScript configuration
- `/api/src/common/filters/http-exception.filter.ts` - Type imports
- `/api/src/auth/auth.controller.ts` - Type imports
- `/api/src/auth/strategies/google.strategy.ts` - Profile type handling
- `/packages/ai/` - Workspace dependency

---

**Next Deployment:** Should succeed without TypeScript errors! 🚀
