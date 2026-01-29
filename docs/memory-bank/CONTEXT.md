# Business Pro - Long-Term Memory & Context Bank

> **This document persists across the entire repository lifecycle and guides all future development decisions.**

**Last Updated:** January 29, 2026  
**Status:** Active Production Context

---

## 1. WHAT WE ARE BUILDING

Business Pro is a **mobile-first, AI-driven SaaS platform** designed to **automatically run social media marketing for local and small businesses in India**, with scalability to global markets.

### Target Users
- Local shops (kirana, tea shops, cafes)
- Salons, clinics, gyms
- Small service businesses
- Owners with **LOW technical knowledge**

### Core Philosophy
- Users should **NEVER** feel they are "using AI"
- The system should think, decide, and suggest **FOR them**
- Minimal inputs, maximum output
- Outcome-driven (engagement, reach), not feature-driven

**This is NOT a generic AI tool.**  
**This is a business automation co-pilot.**

---

## 2. CORE PRODUCT EXPERIENCE

### Primary User Journey (MOST IMPORTANT)

1. User logs in
2. User immediately sees the **Create Experience**
3. No landing dashboards, no clutter
4. The product pushes the user to create content instantly

### Core Screen Layout

```
┌─────────────────────────────────────────────────┐
│  LEFT: Minimal navigation (if necessary)        │
│                                                  │
│  CENTER: Live content preview                   │
│  (generated posts / stories / captions)         │
│                                                  │
│  RIGHT SIDE (VERTICAL):                         │
│  Step-based timeline configuration               │
└─────────────────────────────────────────────────┘
```

### User Interaction Pattern

The user **never fills a big form**.

Instead:
- Each step expands inline on the **RIGHT side**
- Each step has small, minimal inputs
- As the user progresses, the **CENTER updates live**

### Maximum Generated Outputs

- Up to **5 story/content ideas**
- Each story has:
  - AI engagement estimation
  - Floating AI suggestion tags (e.g. "Best for reach", "High engagement", "Trending hook")

### User Actions

Users can:
- Select one story
- Regenerate parts or full content
- Generate captions, hooks, hashtags using lighter models
- Schedule or publish directly to connected social accounts

---

## 3. AI STRATEGY (VERY IMPORTANT)

### AI Access Pattern

AI is accessed **ONLY** through **Vercel AI Gateway**.

### Rules

- Models are selected via **ENUMS**
- **No hard-coded model names** in logic
- Switching models must require **ONLY enum change**

### Model Usage Strategy

- **Heavy models:** story generation, reasoning
- **Light models:** hooks, captions, hashtags, rewrites
- **AI suggestions & engagement estimates:** heuristic + model-assisted

### AI Purpose

AI is used to:
- Reduce thinking for the user
- Recommend instead of ask
- Guide decisions subtly

### AI Abstraction Rules

AI should **NEVER expose**:
- Tokens
- Prompts
- Model names
- Technical explanations

---

## 4. FRONTEND STATUS (DO NOT TOUCH)

### IMPORTANT

There is an existing frontend app located at:

```
/our-app
```

This app:
- Is already well designed
- Has reusable component folders
- Has proper theming
- Has shared UI patterns

### ABSOLUTE RULE

❌ **DO NOT** modify, refactor, or redesign `/our-app`  
❌ **DO NOT** move files inside `/our-app`  
❌ **DO NOT** change component architecture there

Future work may **CONSUME** its components, but not alter them.

---

## 5. BACKEND FOCUS (PRIMARY WORK AREA)

The backend is built using **NestJS**.

### Primary Backend Responsibilities

- Authentication logic (provider-agnostic)
- AI request orchestration
- Social media integrations
- Content lifecycle management
- Scheduling & publishing
- Logging & analytics
- Cost & usage tracking

### Backend Architecture Requirements

Backend must be:
- Modular
- Domain-driven
- Scalable for multi-tenant SaaS

### Suggested NestJS Domain Modules

```
- auth
- users
- organizations
- social-accounts
- content
- ai
- scheduling
- analytics
- billing (future)
- webhooks
- notifications
```

### Module Ownership

Each module must own:
- Its entities
- Its services
- Its controllers
- Its DTOs

---

## 6. DATABASE STRATEGY

### Database Technology

- **PostgreSQL**
- Centralized connection
- Used by backend only

### Database Responsibilities

- Users & organizations
- Connected social accounts
- Generated content
- Story variants
- AI suggestions & scores
- Publishing history
- Usage logs (**VERY IMPORTANT**)
- Error logs
- Feature flags

### AI Action Logging (CRITICAL)

**ALL AI actions must be logged:**

- Which feature
- Which model enum
- Which user
- Timestamp
- Estimated cost bucket (low/medium/high)

---

## 7. PROJECT STRUCTURE (MONOREPO)

This repository is a **unified monorepo**.

### Rules

- **ONE** root `package.json`
- **ONE** `node_modules` directory at root
- Shared dependencies managed centrally

### High-Level Structure

```
/apps
  /our-app        (frontend – DO NOT TOUCH)
  /api            (NestJS backend)
  /worker         (future async jobs)

/packages
  /ui             (shared UI components)
  /config         (eslint, tsconfig, env schemas)
  /types          (shared TypeScript types)
  /utils          (shared helpers)
  /ai             (AI enums, gateways, abstractions)

/docs
  /memory-bank    (THIS CONTEXT LIVES HERE)

/scripts
  (db, migrations, automation)
```

---

## 8. MOBILE-FIRST REQUIREMENT

The entire product must be:
- Fully responsive
- Touch-friendly
- Gesture-safe
- Ready for Capacitor builds

### Mobile Behavior Rules

- Sidebars collapse into bottom navigation
- Steps remain vertically scrollable
- Content preview adapts smoothly
- No hover-only interactions

### Codebase Strategy

**Web and mobile must share the SAME codebase.**

---

## 9. DESIGN SYSTEM & THEMING

### Design Tone

- Super modern
- Clean
- AI-native
- Professional
- Calm & confident

### Theme

- White base
- Purple primary accents
- Soft gradients
- High spacing
- No clutter

### Typography

- Poppins (preferred)
- Clear hierarchy
- Large readable CTAs

### Theming Requirements

Theming must be:
- Centralized
- Token-based
- Easily adjustable globally

---

## 10. PRODUCT RULES (NON-NEGOTIABLE)

- Simplicity over power
- Defaults over configuration
- Guidance over control
- Speed over perfection
- MVP mindset always

### Feature Gate

No feature should exist unless:
- It saves time
- **OR** increases clarity
- **OR** increases engagement

---

## 11. WHAT NOT TO DO

❌ Do not over-engineer  
❌ Do not expose technical internals  
❌ Do not build for agencies first  
❌ Do not add features without usage proof  
❌ Do not optimize prematurely

---

## 12. GOAL

Business Pro should become:

> **"The app a local business opens every morning."**

### Success Criteria

If a non-technical shop owner can:
- Create content
- Publish it
- See engagement

**without thinking** — the product is successful.

---

## 13. DECISION FRAMEWORK

When making any development decision, ask:

1. Does this reduce thinking for the user?
2. Does this align with mobile-first?
3. Does this maintain frontend integrity (`/our-app`)?
4. Does this follow the AI abstraction rules?
5. Does this support the "Create Experience" flow?
6. Is this simple enough for a non-technical user?

If any answer is "no", reconsider the approach.

---

## 14. TECHNICAL CONSTRAINTS SUMMARY

### Frontend
- ✅ Use existing `/our-app` components
- ✅ Mobile-first responsive design
- ✅ Purple theme with Poppins typography
- ❌ Do not modify `/our-app` structure

### Backend
- ✅ NestJS with domain-driven modules
- ✅ PostgreSQL database
- ✅ Centralized AI via Vercel AI Gateway
- ✅ Enum-based model selection
- ✅ Comprehensive logging

### Architecture
- ✅ Monorepo structure
- ✅ Shared dependencies at root
- ✅ Domain modules own their data

---

**This context must guide ALL future decisions.**
