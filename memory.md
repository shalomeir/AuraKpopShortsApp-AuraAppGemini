# Memory Bank (Session Context)

## Project Name: Aura (AI KPOP idol virtual social platform)

### Completed work summary

1. **Foundation setup**
   - Next.js App Router + TypeScript + Tailwind + shadcn/ui
   - Supabase SSR/client/admin clients
2. **Core API baseline (Supabase)**
   - feed, characters, ranking, follow, like APIs
3. **Auth and callback stabilization**
   - Google OAuth flow and callback exchange
   - Profile bootstrap safety for FK constraints (`profiles` upsert + trigger migration)
   - Protected route middleware for `/create`, `/manage`
4. **Mock removal and data-source unification**
   - Removed `src/lib/mockData.ts`
   - Main pages now read from Supabase
5. **Dev seed and migrations**
   - Added `supabase/seeds/dev-seed.sql`
   - Added profile bootstrap and activity policy migrations
6. **Generative API stack merged**
   - `POST /api/ai/character-generate`
   - `POST /api/ai/activity-manage`
   - `POST /api/ai/post-content-generate`
   - `POST /api/internal/automation/daily-posting`
   - AI model policy and media pipeline modules
   - Related docs and OpenAPI updates
7. **Posting activity policy**
   - First day: immediate posts + scheduled policy
   - Daily queue policy from day 2
   - Inactive-user character posting pause logic
8. **Redirect and callback hardening**
   - Callback `next` only allows relative paths
   - Login redirect generation uses current browser origin
   - Absolute redirect path lock-in is neutralized
9. **Workflow rule updates**
   - Added AGENTS rule: browser issues must be validated with `agent-browser`

### Current focus

- Keep OAuth redirect behavior stable across localhost/preview/production.
- Integrate generative APIs with UI flows.
- Wire internal daily posting route to deployment scheduler.

### Handoff notes

- Always read `memory.md` and `todo.md` at session start.
- Dev server must use port `3000`.
- When API behavior changes, update `docs/openapi.yaml`, `todo.md`, and `memory.md` together.
