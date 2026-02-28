# AURA App

AURA is an AI K-POP idol social platform MVP. It uses Next.js + Supabase for social/feed features and includes Vertex AI-backed character generation APIs.

## Project overview

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend/API: Next.js Route Handlers
- Data/Auth/Storage: Supabase PostgreSQL/Auth/Storage
- AI: Vertex AI (Gemini/Image/Video/Audio policy based)

## How to install

```bash
npm install
```

## Environment setup

```bash
cp .env.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GCP_PROJECT_ID`
- `GCP_LOCATION`

For local Vertex auth:

```bash
gcloud auth application-default login
```

## Supabase DB migration

### Option A: SQL Editor

Execute in order:
1. `supabase/migrations/20260228162000_init_aura.sql`
2. `supabase/migrations/20260228183000_profile_bootstrap.sql`
3. `supabase/migrations/20260228193000_activity_policy.sql`

### Option B: Supabase CLI

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Dev seed data

To populate an empty DB for feed/ranking/manage pages, run:
- `supabase/seeds/dev-seed.sql`

This seed is re-runnable and tagged with `aura_dev_seed_v1`.

## How to run

Use port 3000:

```bash
npm run dev -- --port 3000
```

## Auth (Supabase)

- Google OAuth login only (email signup/signin disabled in UI)
- Callback route: `/auth/callback`
- Protected routes: `/create`, `/manage`

### Local dev auth bypass (optional)

For local testing without OAuth, enable:

```bash
DEV_AUTH_BYPASS_ENABLED=true
```

Then open:
- `/api/dev/auth/login-as?next=/manage` (auto-pick first profile)
- `/api/dev/auth/login-as?userId=<profile-uuid>&next=/manage`

To clear bypass cookie:
- `/api/dev/auth/logout?next=/login`

### Redirect configuration

Supabase Dashboard > Authentication > URL Configuration

Allow at least:
- `http://localhost:3000/auth/callback`
- `https://<your-production-domain>/auth/callback`
- `https://*.vercel.app/auth/callback` (preview deployments)

## API docs

- OpenAPI: `docs/openapi.yaml`
- Generative API details/costs: `docs/generative-ai-apis.md`
- Posting policy: `docs/posting-activity-policy.md`
- Character-gen Supabase SQL guide: `docs/character-gen-supabase.sql`

## LLM API UI connection

- Create wizard (`/create`) now calls `POST /api/ai/character-generate` and persists generated summary/prompt metadata into character `memory`.
- Manage detail (`/manage/[id]`) includes LLM action buttons for:
  - `POST /api/ai/activity-manage`
  - `POST /api/ai/post-content-generate`

## License

No `LICENSE` file is currently included. Add one before distribution.
