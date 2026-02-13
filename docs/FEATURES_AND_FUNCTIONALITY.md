# Business Pro — Features & Functionality List

**Document purpose:** Single reference for all current product features and upcoming capabilities (Calling Agent, Intelligent Memory & Context Engine).  
**Last updated:** February 1, 2026.

---

## 1. Current Features & Functionality

### 1.1 Authentication

- **Email/password registration** — New users sign up with email, password, name, business type, business name, and goals.
- **Email/password login** — Sign in with email and password; access and refresh tokens issued.
- **JWT access tokens** — Short-lived access tokens (e.g. 15 minutes) for API requests.
- **Refresh tokens** — Long-lived refresh tokens (e.g. 7 days) for obtaining new access tokens without re-login.
- **Token refresh** — Exchange refresh token for a new access token.
- **Logout** — Invalidate refresh token; user must log in again for new tokens.
- **Get current user (me)** — Return authenticated user’s id, email, name, business type, created date.
- **Password change via OTP (forgot password)** — Send OTP to email, verify OTP, then set new password with a temporary token.
- **Password change (authenticated)** — Change password when logged in using current password and new password.
- **Global route protection** — Protected routes require valid JWT; unauthenticated users redirected to login.

---

### 1.2 User & Profile

- **Get profile** — View own profile (id, email, name, business type, email verified, created date).
- **Update profile** — Update name and business type.
- **Business profile** — Update business name, goals, and related business details.
- **User preferences** — Get and update user preferences (e.g. content tone, language, defaults).
- **Notification settings** — Get and update notification preferences (email, in-app, etc.).
- **Avatar upload** — Set profile avatar via URL.
- **Two-factor authentication (2FA)** — Enable/disable 2FA with secret; optional extra security.
- **Account deletion** — Permanently delete own account.

---

### 1.3 AI Generation & Intelligence

- **Task-based generation** — Request generation by task category (e.g. caption, hooks, hashtags, ideas) with priority (speed/balanced/quality) and complexity; backend selects the best model and returns content.
- **Automatic model selection** — System picks the best AI model per task using suitability, user preferences, and performance.
- **User preference learning** — Past feedback (like/dislike/regenerate/skip) influences future model choice per user and category.
- **Model selection (preview)** — Get recommended model for a task without running generation.
- **Available models by category** — List models that support a given task category.
- **Submit feedback** — Submit like/dislike/regenerate/skip and optional quality rating and reason; used for learning.
- **User preferences by category** — Get user’s top preferred models for a category.
- **Model statistics** — Get usage/performance stats for a model in a category.
- **Generate content ideas/storylines** — Generate multiple content ideas (e.g. up to 5) based on business type, platforms, goal, tone, language, visual style, context.
- **Generate caption** — Generate social caption from business type, goal, tone, language, context.
- **Generate hooks** — Generate attention-grabbing hooks from business type, content type, goal, language.
- **Generate hashtags** — Generate SEO hashtags from caption, business type, platform, language.
- **AI suggestions** — Get timing/trend suggestions by business type and goal.
- **Multi-provider support** — Support for multiple AI providers (e.g. OpenAI, Anthropic, Google) via gateway.
- **Task categorization** — Tasks grouped by type (e.g. text, image, video) for appropriate model routing.
- **Performance tracking** — Aggregate performance and usage tracked per model and category.
- **AI logging** — All AI requests logged (feature, model, user, timestamp, cost bucket) for analytics and learning.

---

### 1.4 Content Management

- **Create content** — Create new content with title, body, type, status, platform, scheduled time, etc.
- **List content** — Get all content with filters (status, type, platform, date range) and pagination.
- **Content statistics** — Get counts by status (draft, scheduled, published, etc.).
- **Recent content** — Get most recent content items (with configurable limit).
- **Scheduled content** — Get content scheduled in a given date range.
- **Get content by ID** — Fetch a single content item by id.
- **Update content** — Update title, body, status, scheduled time, etc.
- **Delete content** — Soft delete content.
- **Duplicate content** — Create a copy of existing content.
- **Publish content** — Publish a piece of content immediately.
- **Reschedule content** — Change scheduled date/time for content.

---

### 1.5 Platform Connections (Social Accounts)

- **List all connections** — Get all connected social/platform accounts for the user.
- **List connected platforms** — Get list of platform names that are connected.
- **Connection status** — Get connection status and details for a specific platform.
- **Connect platform** — Connect a social platform (e.g. Instagram, Facebook) with access token, optional refresh token, expiry, and platform data.
- **Disconnect platform** — Remove connection for a platform.

---

### 1.6 Analytics

- **Overview statistics** — Get high-level stats (e.g. reach, engagement, growth) for a time range.
- **Engagement over time** — Get daily (or periodic) engagement data for charts.
- **Platform performance** — Get performance breakdown by platform for a time range.
- **Top content** — Get top performing content (e.g. by engagement in last 30 days).
- **Time range support** — Analytics queries support configurable date ranges (e.g. 7d, 30d).

---

### 1.7 Dashboard

- **Dashboard stats** — Single endpoint returning content stats, overview metrics, and recent content for the main dashboard.
- **Dashboard recent content** — Get recent content for dashboard with optional limit.

---

### 1.8 Frontend App Experience

- **Login / Signup pages** — Dedicated auth pages with redirect to dashboard when authenticated.
- **Dashboard** — Main post-login view with stats, overview, and recent content.
- **Create experience** — Step-based creation flow with live preview (business type & goal, platform, content type, AI storylines, caption/hook, hashtags/SEO, preview & publish/schedule).
- **Content list** — View, filter, and manage content.
- **Content calendar** — View and manage scheduled content by date.
- **Analytics** — View overview, engagement, platform performance, and top content.
- **Profile** — View and edit profile and business details.
- **Settings** — User preferences, notifications, change password (with OTP flow), 2FA.
- **Pricing** — View plans (e.g. Starter, Pro) with feature comparison.
- **Checkout** — Order summary, payment methods (Card, UPI, Net Banking), contact info, GST, terms; success redirect to dashboard.
- **Mobile-first layout** — Responsive layout, sidebar/bottom nav, touch-friendly, pull-to-refresh where applicable.
- **Theming** — Centralized theme (e.g. purple primary, Poppins), light/dark support where implemented.
- **Route protection** — Middleware enforces auth; unauthenticated users redirected to login; authenticated users visiting login/signup redirected to dashboard.

---

### 1.9 Infrastructure & Quality

- **Monorepo** — Single repo with frontend (our-app), API (api), and shared packages (e.g. AI package).
- **Unified dependencies** — Single root-level dependency management for workspaces.
- **API client generation** — Type-safe API client (e.g. Orval) from OpenAPI/Swagger; auth and retries handled.
- **Database migrations** — TypeORM migrations for schema changes (e.g. business name/goals, engagement, user settings, platform connections).
- **Idempotency / retry** — Client-side behavior to avoid duplicate calls and handle retries where configured.

---

## 2. Upcoming: Calling Agent Feature List

The following capabilities are planned for the **Calling Agent** — a voice/call-based AI agent for local business owners. No code is implied; this is a product-level feature list.

### 2.1 Call Handling

- **Inbound call handling** — AI agent answers incoming business calls when the owner is busy or after hours.
- **Outbound calls** — Initiate outbound calls (e.g. reminders, follow-ups) on behalf of the business.
- **Call routing** — Route calls to the agent or to the owner based on rules (time, caller, topic).
- **Business hours** — Configure when the agent should answer vs. forward or voicemail.
- **Greeting and context** — Customizable greeting and business context (name, type, location, offers) so the agent speaks consistently with the brand.

### 2.2 Voice AI Agent

- **Natural language conversation** — Agent conducts short, goal-oriented conversations in the user’s preferred language (including local/regional).
- **Intent recognition** — Recognize common intents: appointment inquiry, price/availability, location/hours, simple support.
- **Appointment booking by phone** — Take appointment requests via voice and confirm or add to calendar (with owner approval if required).
- **FAQ and info** — Answer common questions (hours, location, services, basic pricing) from a knowledge set.
- **Escalation to human** — Hand off to the business owner or staff when the agent cannot help or when the caller requests a person.
- **Call-back requests** — Capture name and number when owner is unavailable and create a callback task.

### 2.3 Call Logging & Insights

- **Call recording (with consent)** — Optional recording for quality and training, with consent where required.
- **Call summary** — Post-call summary: topic, outcome, requested callback, or booked slot.
- **Call history** — List of calls (inbound/outbound) with date, duration, summary, and link to content/CRM if applicable.
- **Agent performance** — Basic metrics: calls handled, escalation rate, booking rate, satisfaction (if collected).
- **Integration with content/CRM** — Pass call outcomes (e.g. “wants discount offer”) into content ideas or CRM for follow-up.

### 2.4 Configuration & Control

- **Agent personality and script** — Set tone, script snippets, and key phrases (e.g. “We’re a family-run cafe”) so the agent stays on-brand.
- **Do-not-disturb** — Temporarily disable agent and send callers to voicemail or a simple message.
- **Phone number provisioning** — Support for business phone number (existing or provided) and linking to the agent.
- **Multi-language / regional** — Support for primary and secondary languages and regional variants for the target market (e.g. India).

### 2.5 Trust & Compliance

- **Consent and disclosure** — Optional spoken disclosure that the caller is speaking with an AI agent, where required.
- **Privacy and data retention** — Clear retention rules for recordings and transcripts; user control where applicable.
- **Cost and usage** — Transparent usage/cost per call or per month for the calling agent feature.

---

## 3. Upcoming: Intelligent Memory & Context-Aware Social Intelligence

Business Pro will maintain **complete memory and context** for every user so the LLM always has full awareness of the business, content history, performance, and trends. This enables more accurate generation, actionable insights, and fully automated social media management without human intervention.

### 3.1 Complete User & Business Memory

- **Persistent business context** — Store and recall everything about the business: type (e.g. restaurant, salon, cafe), name, goals, offerings, location, tone, style, and preferences.
- **Content memory** — Remember every piece of content created: what posts we built, what storylines we used, what resonated, what did not.
- **Progress tracking** — Track the full journey: content published, formats tried, platforms used, and evolution over time.
- **Rich context for LLM** — Every AI request receives complete, up-to-date context so outputs are tailored to the specific business and history.

### 3.2 Performance & Trend Awareness

- **Social performance tracking** — Continuously monitor whether social performance is improving or decreasing across platforms.
- **Trend detection** — Identify what content types, topics, and formats are trending up or down for each user.
- **Comparative analysis** — Compare current performance to past periods (week-over-week, month-over-month).
- **Performance attribution** — Understand which content, platforms, and actions drove engagement gains or drops.

### 3.3 Real-Time Analysis & Insights

- **Real-time platform data analysis** — Continuously pull and analyze data from connected social platforms (reach, engagement, followers, etc.).
- **Automated insights** — Generate plain-language insights: “What went wrong,” “What we’re improving,” “What’s working best.”
- **Proactive recommendations** — Surface suggestions without user asking: best time to post, content gaps, underperforming platforms.
- **Context-aware recommendations** — Recommendations grounded in the user’s business type, goals, and past performance.

### 3.4 Smarter, Context-Aware AI Generation

- **Full-context generation** — Content ideas, captions, hooks, and hashtags generated with full awareness of past content, performance, and goals.
- **Avoid repetition** — Do not repeat failed approaches; lean into what has worked.
- **Improve over time** — Each generation improves as the system learns from outcomes and feedback.
- **Accurate personalization** — Outputs that feel uniquely tailored to the business and its audience.

### 3.5 Automated Social Media Management

- **Manage all handles** — Automatically manage and optimize all connected social media accounts.
- **Engagement maximization** — Systematically refine strategy to engage more and more users.
- **Automated optimization** — Adjust posting cadence, content mix, and recommendations based on real-time data.
- **Hands-free operation** — Operate largely without human intervention; system learns, optimizes, and acts on insights.

### 3.6 Continuous Learning Loop

- **Outcome feedback** — Use actual engagement and performance data to refine future content and strategy.
- **Self-improvement** — System grows smarter with each interaction and each piece of published content.
- **Failure and success learning** — Explicitly learn from underperforming content and double down on what works.

---

## 4. Summary Tables

### Current: Feature Areas

| Area              | Key capabilities                                                                 |
|-------------------|-----------------------------------------------------------------------------------|
| Authentication    | Register, login, JWT + refresh, logout, password change (OTP + in-app), route guard |
| User & profile    | Profile, business profile, preferences, notifications, avatar, 2FA, delete account |
| AI                | Task-based generation, auto model selection, feedback learning, ideas/caption/hooks/hashtags, suggestions |
| Content           | CRUD, stats, recent, scheduled, duplicate, publish, reschedule                    |
| Platforms         | List/connect/disconnect social accounts, connection status                       |
| Analytics         | Overview, engagement over time, by platform, top content, date range              |
| Dashboard         | Combined stats and recent content                                                 |
| Frontend          | Create flow, content, calendar, analytics, profile, settings, pricing, checkout   |

### Upcoming: Calling Agent

| Area              | Key capabilities                                                                 |
|-------------------|-----------------------------------------------------------------------------------|
| Call handling     | Inbound/outbound, routing, business hours, greeting, context                     |
| Voice AI          | Conversation, intents, appointment booking, FAQ, escalation, callback capture    |
| Logging & insights| Recording (consent), summary, history, performance, link to content/CRM           |
| Configuration     | Personality/script, DND, phone number, multi-language/regional                   |
| Trust & compliance| Disclosure, privacy, retention, cost/usage visibility                            |

### Upcoming: Intelligent Memory & Context-Aware Social Intelligence

| Area                 | Key capabilities                                                                 |
|----------------------|-----------------------------------------------------------------------------------|
| User & business memory | Complete context (business type, content history, progress) persisted for every user |
| Performance awareness  | Track improving/decreasing social performance; trend detection; comparative analysis |
| Real-time analysis    | Live platform data analysis; automated insights on what’s working and what’s not  |
| Context-aware AI      | LLM receives full context; accurate, personalized generation; avoids repetition |
| Automated management  | Manage all handles; maximize engagement; optimize without human intervention     |
| Continuous learning  | Outcome feedback; self-improvement from success and failure                       |

---

*This document is maintained in `/docs` and should be updated as features ship or plans change.*
