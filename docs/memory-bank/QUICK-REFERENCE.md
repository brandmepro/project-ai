# Business Pro - Quick Reference Guide

> Quick lookup for common development decisions

## 🚫 ABSOLUTE RULES

### Frontend
- ❌ **NEVER** modify `/our-app` structure or components
- ✅ **ONLY** consume components from `/our-app`
- ✅ Mobile-first, responsive, touch-friendly

### AI Integration
- ✅ **ONLY** use Vercel AI Gateway
- ✅ **ONLY** use enum-based model selection
- ❌ **NEVER** expose tokens, prompts, or model names
- ✅ **ALWAYS** log AI actions (feature, model enum, user, timestamp, cost bucket)

### Architecture
- ✅ Monorepo: ONE root `package.json`, ONE `node_modules`
- ✅ NestJS backend with domain-driven modules
- ✅ PostgreSQL database (backend only)
- ✅ Each module owns: entities, services, controllers, DTOs

## 🎯 CORE PRINCIPLES

1. **User never feels they're using AI** - Hide technical details
2. **Create Experience is primary** - No landing dashboards, push to create
3. **Mobile-first** - Responsive, touch-friendly, gesture-safe
4. **Simplicity over power** - Defaults over configuration
5. **Outcome-driven** - Engagement & reach, not features

## 📐 SCREEN LAYOUT

```
LEFT:    Minimal navigation (if needed)
CENTER:  Live content preview (generated posts/stories)
RIGHT:   Step-based timeline (expands inline)
```

## 🤖 AI MODEL STRATEGY

- **Heavy models:** Story generation, reasoning
- **Light models:** Hooks, captions, hashtags, rewrites
- **Heuristics:** AI suggestions, engagement estimates

## 🎨 DESIGN TOKENS

- **Base:** White
- **Primary:** Purple accents
- **Typography:** Poppins (preferred)
- **Style:** Modern, clean, AI-native, calm & confident

## 📁 PROJECT STRUCTURE

```
/apps
  /our-app     ← Frontend (DO NOT TOUCH)
  /api         ← NestJS backend
  /worker      ← Future async jobs

/packages
  /ui          ← Shared UI components
  /config      ← ESLint, TSConfig, env schemas
  /types       ← Shared TypeScript types
  /utils       ← Shared helpers
  /ai          ← AI enums, gateways, abstractions

/docs
  /memory-bank ← Context & decisions
```

## ✅ FEATURE GATE

Only add features if they:
- Save time **OR**
- Increase clarity **OR**
- Increase engagement

## 🎯 SUCCESS METRIC

> "The app a local business opens every morning."

A non-technical shop owner should be able to:
- Create content
- Publish it
- See engagement

**Without thinking.**

---

**For full context, see [CONTEXT.md](./CONTEXT.md)**
