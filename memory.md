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

### Session update (2026-02-28)

1. Connected create wizard to `POST /api/ai/character-generate` before DB insert.
2. Extended `POST /api/characters` to accept optional `memory` payload so generated bio/prompt data can be persisted.
3. Added manage detail LLM action panel:
   - `POST /api/ai/activity-manage` trigger button
   - `POST /api/ai/post-content-generate` trigger button
4. Updated TODO progress for LLM copy integration.
5. Added Vertex text model fallback strategy (`MODEL_TEXT_FALLBACK`) and safer defaults (`gemini-2.0-flash-001`).
6. Changed character generation persistence to continue even when Supabase Storage is unavailable (returns `storageBucket/storagePath` as `null`).
7. Verified API runtime call for `POST /api/ai/character-generate` returns generated payload on localhost.
8. Added local dev auth bypass:
   - `GET /api/dev/auth/login-as?next=/manage`
   - `GET /api/dev/auth/logout?next=/login`
   - Cookie-based bypass for middleware/API/page auth checks (dev only).
9. Browser validation with `agent-browser` completed:
   - `/manage` access via dev bypass works
   - `Generate Today Plan` succeeds
   - `Generate Draft Post` succeeds with draft ID rendered
10. Hardened post generation stability:
   - Auto-classifier parse failure now falls back to deterministic media mode
   - Post content schema failure now falls back to safe default content instead of hard error

### Handoff notes

- Always read `memory.md` and `todo.md` at session start.
- Dev server must use port `3000`.
- When API behavior changes, update `docs/openapi.yaml`, `todo.md`, and `memory.md` together.
