# EchoLearn — Current Standing

_Snapshot date: 2026-05-15 (based on repo state through last commit, 2025-09-20)_

This document captures the state of the EchoLearn codebase after a long break, so you can re-orient quickly. It covers what the product is, how it's built, what's recently been worked on, and where the rough edges are.

---

## 1. What EchoLearn Is

**EchoLearn (echolearn.ai)** is an AI-powered, voice-first tutoring platform built around the idea of **"learning by teaching aloud."** Students hold spoken conversations with an AI tutor; the system generates summaries, quizzes, and feedback to reinforce understanding.

**Learning modes** the product supports:
1. **Conversation** — natural voice/text dialogue with the AI tutor (primary mode).
2. **Blurting** — the student dumps everything they know on a topic; AI feeds back on gaps.
3. **Teaching** — the student explains a concept aloud; AI evaluates understanding.
4. **Quiz** — AI generates a personalized quiz from the conversation and grades answers.

There is also a separate **waitlist landing site** (static HTML build, Formspree-backed) under `frontend/echolearn-waitlist-final/` and `frontend/standalone-waitlist.html`.

---

## 2. Architecture at a Glance

```
Frontend (Vite + React SPA)  ──/api/*──▶  Backend (Next.js API)  ──▶  OpenAI
   app.echolearn.ai                       (Next 15 App Router)        Retell AI
                                                                       VAPI
                                                                       Stripe
                                                                       Supabase
```

- **Frontend**: Vite + React 18 + TypeScript SPA. Vite dev proxies `/api/*` to the backend on port 3000.
- **Backend**: Next.js 15.3.4 (App Router) acting as an API server.
- **DB / Auth**: Supabase (PostgreSQL + Auth, RLS enforced).
- **Voice**: Retell AI (primary, used in `RetellConversation.tsx`) + VAPI (recently added for call recording / usage tracking).
- **Payments**: Stripe (subscriptions, webhooks, billing portal).
- **Deployment**: Vercel for both frontend and backend.
- **Domain layout**: apex `/` redirects to `https://app.echolearn.ai` via `backend/middleware.ts`, which also applies CSP + standard security headers.

---

## 3. Backend (`/backend`)

Next.js 15 App Router, TypeScript. All API routes live under `backend/app/api/`.

### API routes

| Endpoint | Purpose |
|---|---|
| `/chat` | Text chat with OpenAI; logs messages; supports blurting mode |
| `/quiz` | Generate personalized quiz from conversation history |
| `/evaluate` | Grade user answers to quiz questions |
| `/blurt` | Blurting evaluation |
| `/teach` | Teaching-mode evaluation |
| `/title` | Generate conversation titles |
| `/vapi/get-call` | Pull VAPI call details, record voice usage in Supabase |
| `/voice/check-limits` | Check remaining voice minutes |
| `/stripe/create-checkout-session` | Start Stripe Checkout (email pre-filled) |
| `/stripe/verify-session` | **Fallback** verification when webhooks miss — called from SuccessPage |
| `/stripe/webhook` | Stripe webhook handler (subscription created/updated/deleted) |
| `/stripe/fix-subscription` | **Emergency manual fix** for desynced subscriptions |
| `/stripe/create-portal-session` | Open Stripe billing portal |
| `/subscription/check-limits` | Check monthly message/quiz limits |
| `/subscription/increment-usage` | Bump usage counters |
| `/reset-usage` | Admin reset for voice usage |
| `/retell-get-call.disabled` | Legacy, disabled |

### Libraries (`backend/lib/`)
- `stripe.ts` — Stripe client setup.
- `rateLimit.ts` — `express-rate-limit` wrapper for API endpoints.

### Key dependencies
`next@15.3.4`, `openai@5.5.1`, `@supabase/supabase-js@2.54.0`, `stripe@18.4.0`, `express-rate-limit@8.0.1`.

### Required env vars (see `backend/ENV_VARS.md`)
`NEXT_PUBLIC_APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RETELL_API_KEY`, `RETELL_AGENT_ID`, `VAPI_PRIVATE_API_KEY`, `VAPI_ASSISTANT_ID`.

---

## 4. Frontend (`/frontend`)

Vite + React 18 + TypeScript SPA, Tailwind v3 + shadcn/ui.

### Pages (`src/pages/`)
- `Index.tsx` (~33K) — main authenticated app shell with nav, theme toggle, profile modal.
- `Auth.tsx` (~16K) — signup / login / password reset (Supabase Auth).
- `SuccessPage.tsx` (~7.5K) — post-payment page; **auto-calls `/stripe/verify-session` as a webhook fallback**.
- `CancelPage.tsx` — payment cancel.
- `ResetPassword.tsx` — password reset flow.
- `TermsOfService.tsx`, `PrivacyPolicy.tsx` — legal (updated Sep 2025).
- `AdminFix.tsx` (~2.2K, added Sep 20) — admin page to repair subscription state via `/stripe/fix-subscription`.
- `NotFound.tsx`.

### Key components (`src/components/`)
- `ChatInterface.tsx` (~49K) — main chat panel; voice session state, transcript injection.
- `RetellConversation.tsx` (~15K) — Retell voice integration (`retell-client-js-sdk`).
- `QuizPanel.tsx` (~20K) — quiz UI, evaluation, progress.
- `SummaryPanel.tsx` — summaries + study tips.
- `ConversationHistory.tsx` (~14K) — sidebar with session switching.
- `Sidebar.tsx` — nav drawer, profile, conversation list.
- `LandingPage.tsx` (~47K) — marketing landing page (redesigned Jan 2025 with morphing-blob animations, glass cards, Phosphor icons).
- `StripePricing.tsx` — pricing card.
- `BlurtingInterface.tsx`, `TeachingInterface.tsx` — mode-specific UIs.
- `UsageLimitsDisplay.tsx` — remaining voice min / messages / quizzes.
- `OnboardingTour.tsx` — first-time walkthrough.
- `ui/` — 51 shadcn/ui primitive files.

### Contexts (`src/contexts/`)
- `AppContext.tsx` (~51K) — central state: conversations, active session, voice state, subscription limits, quiz data.
- `AuthContext.tsx` — user/session/login/signup/logout.
- `ThemeContext.tsx` — light/dark.

### Libraries (`src/lib/`)
- `api.ts` — fetch wrappers for backend endpoints.
- `conversation.ts` — `ConversationService`: message state, voice lifecycle, session isolation.
- `conversationStorage.ts` — local-storage persistence.
- `supabaseConversationStorage.ts` (~14K) — remote sync layer for conversations.
- `supabase.ts` — client init.
- `subscription.ts` — plan checks.
- `utils.ts`.

### Build & deploy
- `vite.config.ts` proxies `/api/*` to `http://localhost:3000` in dev.
- `vercel.json` rewrites `/api/*` to the backend and falls back all other routes to `/` (SPA routing).
- `package.json` has a separate `build:waitlist` script for the static waitlist build.

### Notable frontend deps
`react-router-dom@6`, `@tanstack/react-query`, `framer-motion@12`, `phosphor-react` + `lucide-react`, `react-hook-form` + `zod`, `retell-client-js-sdk@2`, `@vapi-ai/web@2.3.8`, `sonner`, `date-fns`, `recharts`.

---

## 5. Database (Supabase / PostgreSQL)

Schema lives across these SQL files in the repo root:
- `supabase-setup.sql` — base schema (users, conversations, RLS).
- `subscription-schema.sql` — subscription/usage/limits tables.
- `migration-only.sql` — idempotent migration (quiz columns, profile picture).
- `fix-voice-minutes-precision.sql` — `usage_count` INTEGER → DECIMAL(10,2).
- `fix-teaching-mode.sql` — adds `'teaching'` to `learning_mode` enum constraint.
- `fix-constraint.sql`, `fix-corrupted-constraint.sql`, `check-all-constraints.sql`, `verify-constraint.sql` — constraint debugging/repair scripts.

### Tables

**`users`** (extends `auth.users`)
- `id` (UUID, FK), `email`, `name`, `profile_picture`
- Stripe link: `stripe_customer_id`, `subscription_id`
- Subscription: `subscription_status` (`free | active | past_due | canceled | unpaid`), `subscription_plan` (`free | pro`)
- Billing window: `current_period_start`, `current_period_end`
- RLS: users read/write their own row only.

**`conversations`**
- `id`, `user_id`, `title`, `messages` (JSONB array of `{role, content}`)
- `learning_mode` (`conversation | blurting | teaching`)
- `summary`, `quiz_questions`, `quiz_answers`, `quiz_evaluations`, `quiz_show_answers`
- `blurt_content`, `blurt_feedback`, `blurt_completed`
- `teaching_content`, `teaching_feedback`, `teaching_completed`
- `is_active` (soft delete), indexed on `user_id`, `created_at`, `learning_mode`
- RLS: owner-only.

**`subscription_usage`**
- `(user_id, feature_name, reset_date)` unique
- `feature_name` ∈ `voice_minutes | messages | quizzes`
- `usage_count` DECIMAL(10,2) (so 1.5 minutes is preserved)
- RLS: owner-only.

**`plan_limits`** (read-only to clients)
- `free`: 50 voice min/mo, 300 messages/mo, 3 quizzes/day
- `pro`: 150 voice min/mo, 900 messages/mo, 10 quizzes/day
- Feature flags: `can_use_voice`, `can_use_quiz`, `can_use_summary`, `can_use_blurting`, `can_use_teaching`

### Triggers
- `handle_new_user()` auto-creates a `users` row on signup.
- `update_updated_at_column()` keeps `updated_at` in sync.

---

## 6. Integrations

| Service | Use | Status |
|---|---|---|
| OpenAI | chat, quiz, summaries, mode feedback | active |
| Retell AI | primary voice conversations | active |
| VAPI | secondary voice path + call recording / usage attribution | recently integrated (Sep 2025) |
| Stripe | subscriptions, webhooks, billing portal | active, with manual-repair endpoints |
| Supabase | Postgres + Auth + RLS | active |
| Formspree | waitlist email capture | static-site only |

---

## 7. Recent Activity (last sprint, Aug–Sep 2025)

Working tree was clean as of the snapshot. Last 10 commits, newest first:

- `ece6d62` (Sep 20) Fix TypeScript error in fix-subscription endpoint
- `3eb0f52` (Sep 20) Fix subscription sync issue between Stripe and Supabase
- `27e3d94` (Sep 6) Replace hardcoded VAPI assistant ID with env vars
- `ce22215` (Sep 6) Count conversation-mode chat messages toward limit
- `4693f23` (Sep 6) Fix voice minutes calculation and tracking
- `93b92ec` (Aug 22) Merge origin/main
- `4a21c7d` (Aug 22) UI responsiveness for message/voice/quiz limit-reached
- `8aebee7` (Aug 8) Improve voice minute accuracy + debugging
- `f1634f4` (Aug 8) Trigger backend redeploy for voice API
- `466404b` (Aug 6) Comprehensive voice-minute tracking + usage display

**Recent theme:** stabilizing **payments** and **voice-minute accounting** — not new feature work.

---

## 8. Known Issues & Things That Were Being Fixed

Documented in the various `*_README.md` and `*_FIX.md` files at the repo root and inside `frontend/`:

1. **Subscription sync (`SUBSCRIPTION_FIX_README.md`, last touched Sep 20)**
   - Stripe payment succeeded but `users.subscription_status` in Supabase wasn't updating.
   - Webhook-only flow was unreliable. Mitigations added:
     - Enhanced webhook logging.
     - `/stripe/verify-session` fallback, auto-called from `SuccessPage.tsx`.
     - `/stripe/fix-subscription` emergency endpoint + `AdminFix.tsx` UI.
   - **Status:** patched but not architecturally clean — the emergency-fix endpoint and admin page still exist, which suggests the underlying webhook flow wasn't fully trusted.

2. **Conversation isolation (`CONVERSATION_ISOLATION_FIX.md`)**
   - Starting a new conversation leaked context from the previous one.
   - Fixed via `currentSessionMessages` tracking and session-specific clearing in `ConversationService`.

3. **Voice integration regressed after the isolation fix** — restored Retell calls in `startConversation()`.

4. **Voice-minute precision** — `usage_count` was INTEGER, so half-minutes rounded away. Migrated to DECIMAL(10,2).

5. **Teaching mode constraint** — `'teaching'` wasn't in the `learning_mode` enum, blocking that mode end-to-end. Fixed via `fix-teaching-mode.sql`.

No `TODO`/`FIXME` comments were found in source.

---

## 9. Loose Ends / Cleanup Candidates

Things worth tidying up next time you sit down with this:

- **Lots of `*.sql` files at the repo root** (`fix-*.sql`, `check-*.sql`, `verify-*.sql`, `migration-only.sql`). These are one-off DB hotfix scripts that should probably be moved into a `db/migrations/` (or similar) folder, or applied + deleted. Their presence at root is a sign of in-flight debugging.
- **`reset-voice-usage.js` exists both at repo root and inside `backend/`** — probably one is stale.
- **`backend/next.config.js` and `backend/next.config.ts` both exist** — Next will pick one; the other is dead weight.
- **Waitlist artifacts** in `/frontend`: `echolearn-waitlist-FINAL.zip`, `echolearn-waitlist-FIXED.zip`, `echolearn-waitlist-final/`, `waitlist-build/`, `standalone-waitlist.html` — multiple zips and builds of the same waitlist site; only one is current.
- **`retell-get-call.disabled` route** — disabled-but-present legacy route, fine to delete if Retell stays primary.
- **Stripe fix-subscription / AdminFix page** — emergency tooling; the goal should be deleting these by making the webhook + verify-session path bulletproof.
- **No tests** visible in either package.

---

## 10. Tech Stack Summary

| Layer | Stack |
|---|---|
| Frontend | Vite + React 18 + TypeScript, Tailwind v3, shadcn/ui, React Router 6, TanStack Query, Framer Motion |
| Backend | Next.js 15 (App Router), TypeScript |
| DB / Auth | Supabase (PostgreSQL, RLS, Supabase Auth) |
| AI | OpenAI (chat/quiz/summary) |
| Voice | Retell AI (primary) + VAPI (call recording / usage) |
| Payments | Stripe (subscriptions, webhooks, billing portal) |
| State | React Context (`AppContext`, `AuthContext`, `ThemeContext`) |
| Forms / Validation | react-hook-form + zod |
| Deployment | Vercel (frontend + backend) |
| Tooling | ESLint, TypeScript strict, npm + bun (`bun.lockb` in frontend) |

---

## 11. Where to Start When You Come Back

Reasonable on-ramps depending on what you want to do next:

- **Just re-orient:** read `frontend/src/contexts/AppContext.tsx` and `frontend/src/components/ChatInterface.tsx` — that's where most app behavior is centralized.
- **Continue the subscription stabilization thread:** look at `backend/app/api/stripe/webhook/route.ts`, `backend/app/api/stripe/verify-session/route.ts`, and the auto-verify hook in `frontend/src/pages/SuccessPage.tsx`. Goal: make this path reliable enough to remove `/stripe/fix-subscription` and `AdminFix.tsx`.
- **Voice work:** `frontend/src/components/RetellConversation.tsx` + `backend/app/api/vapi/get-call/` for usage accounting. Recent commits focused here.
- **DB hygiene:** consolidate the root-level `*.sql` files into a single migrations folder.

---

_Generated from a code-only inspection — no servers were started, no Supabase data was read. Anything dependent on runtime state (live Stripe webhook health, current user counts, etc.) is unverified and should be checked against the deployed services._
