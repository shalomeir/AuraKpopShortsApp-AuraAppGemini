# ✦ AURA (오라) — Technical Requirements Document (TRD)

### AI KPOP 아이돌 가상 소셜 플랫폼 | MVP v0.1

---

## 0. 확정 스펙 스냅샷

| 영역          | 기술 선택                           | 비고                                 |
| ------------- | ----------------------------------- | ------------------------------------ |
| Framework     | Next.js 14+ (App Router)            | Vercel 배포                          |
| UI 컴포넌트   | shadcn/ui + Tailwind CSS            |                                      |
| Database      | Supabase Postgres                   |                                      |
| Auth          | Supabase Auth                       | Google OAuth + 이메일/비밀번호       |
| Storage       | Supabase Storage                    | 이미지/GIF 미디어                    |
| 배치 시스템   | Supabase Edge Functions + pg_cron   | 하루 4건 자동 포스팅                 |
| LLM 호출      | GCP Gemini API (Vertex AI)          | Vercel AI SDK 제거, Gemini 단일 사용 |
| 이미지 생성   | GCP Imagen 3 (Nano / Imagen 4 계열) |                                      |
| 영상 생성     | GCP Veo                             | MVP는 2~4초 루프 GIF                 |
| 피드 업데이트 | Polling (interval fetch)            | Realtime은 Phase 2                   |
| PWA           | 미포함                              | Phase 2 검토                         |

---

## 1. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                   │
│         Next.js App Router + shadcn/ui               │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────┐
│              Next.js API Routes (Vercel)             │
│   /api/characters  /api/posts  /api/feed  /api/ai   │
└──────┬────────────────────────┬─────────────────────┘
       │                        │
┌──────▼──────┐        ┌────────▼────────────────────┐
│  Supabase   │        │        GCP APIs              │
│  - Postgres │        │  - Imagen 3 (이미지 생성)    │
│  - Auth     │        │  - Veo (루프 GIF 생성)       │
│  - Storage  │        └─────────────────────────────┘
│  - Edge Fn  │
└──────┬──────┘        ┌─────────────────────────────┐
       │               │      GCP Gemini API          │
       │               │  - LLM 카피 생성             │
┌──────▼──────┐        │  - 캐릭터 메모리 서사 생성   │
│  pg_cron    │        │  (Model: Gemini 1.5 계열)    │
│  배치 트리거│        └─────────────────────────────┘
└─────────────┘
```

---

## 2. 디렉터리 구조

```
aura/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts     # Supabase OAuth callback
│   ├── (main)/
│   │   ├── layout.tsx            # 메인 레이아웃 (하단 네비)
│   │   ├── feed/page.tsx         # 메인 피드 (3탭)
│   │   ├── ranking/page.tsx      # 인기 랭킹
│   │   ├── manage/page.tsx       # 내 캐릭터 관리
│   │   └── character/[id]/page.tsx  # 캐릭터 프로필
│   ├── api/
│   │   ├── characters/
│   │   │   ├── route.ts          # POST: 캐릭터 생성
│   │   │   └── [id]/route.ts     # GET/PATCH: 캐릭터 조회/수정
│   │   ├── posts/
│   │   │   ├── route.ts          # GET: 피드 조회 (폴링)
│   │   │   └── [id]/
│   │   │       ├── like/route.ts
│   │   │       └── share/route.ts
│   │   ├── feed/route.ts         # GET: 추천/팔로우/내캐릭터 피드
│   │   ├── follow/route.ts       # POST/DELETE: 팔로우
│   │   └── ai/
│   │       ├── generate-post/route.ts   # 포스팅 콘텐츠 생성
│   │       ├── generate-image/route.ts  # GCP Imagen 호출
│   │       └── generate-gif/route.ts    # GCP Veo 호출
│   └── layout.tsx
├── components/
│   ├── feed/
│   │   ├── FeedCard.tsx
│   │   ├── FeedTabs.tsx
│   │   └── FeedPolling.tsx
│   ├── character/
│   │   ├── CharacterCreateWizard.tsx
│   │   ├── CharacterCard.tsx
│   │   └── CharacterMemoryTimeline.tsx
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # 브라우저용 Supabase client
│   │   ├── server.ts             # 서버용 Supabase client
│   │   └── middleware.ts         # Auth 미들웨어
│   ├── ai/
│   │   ├── llm.ts                # GCP Gemini API (Vertex AI) 호출 유틸
│   │   ├── prompts.ts            # 캐릭터별 프롬프트 템플릿
│   │   └── memory.ts             # 메모리 → 프롬프트 변환
│   └── gcp/
│       ├── imagen.ts             # Imagen 3 클라이언트
│       └── veo.ts                # Veo 클라이언트
├── supabase/
│   ├── migrations/               # DB 마이그레이션
│   └── functions/
│       └── batch-post/index.ts   # Edge Function: 자동 포스팅
└── types/
    ├── character.ts
    ├── post.ts
    └── database.ts               # Supabase DB 타입
```

---

## 3. 데이터베이스 스키마

### 3-1. users (Supabase Auth 기본 테이블 확장)

```sql
-- auth.users는 Supabase 자동 생성
-- 아래는 public.profiles로 확장

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 3-2. characters (AI 아이돌 캐릭터)

```sql
CREATE TABLE public.characters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 기본 정보
  name            TEXT NOT NULL,
  gender          TEXT,                          -- female | male | nonbinary
  age_range       TEXT,                          -- teen | twenties | thirties
  nationality     TEXT,

  -- 외모 & 컨셉
  face_shape      TEXT,
  hair_color      TEXT,
  fashion_mood    TEXT,
  concept         TEXT,                          -- cute | sexy | boyish | innocent

  -- 아이돌 정체성
  position        TEXT[],                        -- main_vocal | main_dancer | rapper | visual | leader | entertainer
  signature_mood  TEXT,                          -- bright | dark | mysterious | comic
  persona         TEXT,                          -- casual | perfect | quirky | artist
  comment_tone    TEXT DEFAULT 'friendly',       -- friendly | provocative | chic | playful

  -- 활동 모드 (선택된 콘텐츠 유형 목록)
  activity_modes  TEXT[] DEFAULT ARRAY['performance','daily','meme','fan'],

  -- 서사 & 메모리 (JSONB)
  memory          JSONB DEFAULT '{
    "debut_story": null,
    "milestones": [],
    "last_event": null,
    "post_count": 0
  }'::jsonb,

  -- 스탯
  fan_level       INT DEFAULT 0,
  follower_count  INT DEFAULT 0,

  -- 메타
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_characters_owner ON public.characters(owner_id);
CREATE INDEX idx_characters_fan_level ON public.characters(fan_level DESC);
```

### 3-3. posts (AI 자동 생성 포스팅)

```sql
CREATE TABLE public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id    UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,

  -- 콘텐츠
  content_type    TEXT NOT NULL,                 -- image | moving_poster
  caption         TEXT,                          -- LLM 생성 카피
  media_url       TEXT,                          -- Supabase Storage URL
  media_thumb_url TEXT,                          -- 썸네일 URL

  -- 생성 컨텍스트
  activity_mode   TEXT,                          -- 어떤 활동 모드로 생성됐는지
  batch_sequence  INT,                           -- 1~4 (하루 4번 중 몇 번째)
  generation_meta JSONB DEFAULT '{}'::jsonb,     -- 프롬프트, 모델 버전 등 로깅용

  -- 스탯
  like_count      INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  share_count     INT DEFAULT 0,

  -- 메타
  status          TEXT DEFAULT 'published',      -- generating | published | failed
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_character ON public.posts(character_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_status ON public.posts(status);
```

### 3-4. post_likes

```sql
CREATE TABLE public.post_likes (
  post_id     UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
```

### 3-5. follows

```sql
CREATE TABLE public.follows (
  follower_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, character_id)
);

CREATE INDEX idx_follows_character ON public.follows(character_id);
```

### 3-6. batch_queue (pg_cron 작업 추적)

```sql
CREATE TABLE public.batch_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  sequence      INT NOT NULL,                    -- 1~4
  status        TEXT DEFAULT 'pending',          -- pending | processing | done | failed
  attempts      INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  processed_at  TIMESTAMPTZ
);

CREATE INDEX idx_batch_queue_scheduled ON public.batch_queue(scheduled_at, status);
```

### 3-7. RLS (Row Level Security) 정책

```sql
-- characters: 본인 캐릭터만 수정 가능, 전체 읽기 허용
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_public_read" ON public.characters
  FOR SELECT USING (TRUE);

CREATE POLICY "characters_owner_write" ON public.characters
  FOR ALL USING (auth.uid() = owner_id);

-- posts: 전체 읽기 허용, 시스템(service_role)만 쓰기
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read" ON public.posts
  FOR SELECT USING (status = 'published');

-- follows, post_likes: 본인 데이터만 쓰기
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_own" ON public.follows
  FOR ALL USING (auth.uid() = follower_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_own" ON public.post_likes
  FOR ALL USING (auth.uid() = user_id);
```

---

## 4. 자동 포스팅 배치 시스템

### 4-1. 전체 플로우

```
캐릭터 생성
    │
    ├─ 즉시 (T+0)       → batch_queue에 sequence=1 INSERT
    ├─ T+5분            → batch_queue에 sequence=2 INSERT
    ├─ T+1시간          → batch_queue에 sequence=3 INSERT
    └─ T+8시간          → batch_queue에 sequence=4 INSERT

pg_cron (1분 간격 실행)
    │
    └─ scheduled_at <= NOW() AND status='pending' 인 항목 조회
           │
           ▼
    Edge Function: batch-post/index.ts
           │
    ┌──────┴──────────────────────────┐
    │ 1. 캐릭터 정보 + 메모리 로드     │
    │ 2. LLM → 카피 생성               │
    │ 3. GCP Imagen → 이미지 생성      │
    │ 4. (sequence=2) GCP Veo → GIF   │
    │ 5. Supabase Storage → 업로드     │
    │ 6. posts 테이블 INSERT           │
    │ 7. characters.memory JSONB 업데이트 │
    │ 8. batch_queue status='done'     │
    └─────────────────────────────────┘
```

### 4-2. pg_cron 설정

```sql
-- 1분마다 pending 배치 실행
SELECT cron.schedule(
  'process-batch-queue',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/batch-post',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  );
  $$
);
```

### 4-3. Edge Function 핵심 로직 (pseudo-code)

```typescript
// supabase/functions/batch-post/index.ts

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 처리할 배치 항목 조회 (한 번에 최대 10개)
  const { data: jobs } = await supabase
    .from("batch_queue")
    .select("*, characters(*)")
    .lte("scheduled_at", new Date().toISOString())
    .eq("status", "pending")
    .limit(10);

  for (const job of jobs) {
    await supabase
      .from("batch_queue")
      .update({ status: "processing", attempts: job.attempts + 1 })
      .eq("id", job.id);

    try {
      // 1. 활동 모드 랜덤 선택
      const mode = pickActivityMode(job.characters.activity_modes);

      // 2. LLM 카피 생성
      const caption = await generateCaption(job.characters, mode);

      // 3. 이미지 생성 (GCP Imagen)
      const imageBuffer = await generateImage(job.characters, caption);

      // 4. GIF 생성 (sequence=2일 때만, GCP Veo)
      const mediaBuffer =
        job.sequence === 2 ? await generateGif(imageBuffer) : imageBuffer;

      // 5. Supabase Storage 업로드
      const mediaUrl = await uploadMedia(
        supabase,
        job.character_id,
        mediaBuffer,
      );

      // 6. posts INSERT
      await supabase.from("posts").insert({
        character_id: job.character_id,
        content_type: job.sequence === 2 ? "moving_poster" : "image",
        caption,
        media_url: mediaUrl,
        batch_sequence: job.sequence,
        activity_mode: mode,
      });

      // 7. 메모리 업데이트
      await updateCharacterMemory(supabase, job.characters, caption, mode);

      await supabase
        .from("batch_queue")
        .update({ status: "done", processed_at: new Date() })
        .eq("id", job.id);
    } catch (e) {
      const nextStatus = job.attempts >= 3 ? "failed" : "pending";
      await supabase
        .from("batch_queue")
        .update({ status: nextStatus })
        .eq("id", job.id);
    }
  }
});
```

---

## 5. LLM 카피 생성 (GCP Gemini API)

### 5-1. Vertex AI Gemini 연동

```typescript
// lib/ai/llm.ts
import { VertexAI } from "@google-cloud/vertexai";

const vertex = new VertexAI({
  project: GCP_PROJECT_ID,
  location: "us-central1",
});
// Gemini 1.5 계열 모델 사용
const model = vertex.preview.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateCaption(
  character: Character,
  activityMode: string,
): Promise<string> {
  const prompt = buildCaptionPrompt(character, activityMode);

  const request = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 200,
      temperature: 0.7,
    },
  };

  const response = await model.generateContent(request);
  return response.response.candidates[0].content.parts[0].text;
}
```

### 5-2. 프롬프트 구조

```typescript
// lib/ai/prompts.ts

function buildCaptionPrompt(character: Character, mode: string): string {
  const memory = character.memory;
  return `
당신은 KPOP 아이돌 "${character.name}"입니다.

[캐릭터 정보]
- 포지션: ${character.position.join(", ")}
- 컨셉: ${character.concept}
- 무드: ${character.signature_mood}
- 페르소나: ${character.persona}
- 말투 톤: ${character.comment_tone}

[현재 서사]
- 데뷔 이후 포스팅 수: ${memory.post_count}
- 최근 이벤트: ${memory.last_event ?? "데뷔 직후"}
- 주요 마일스톤: ${memory.milestones.slice(-3).join(" → ")}

[오늘 활동 유형]: ${mode}

위 캐릭터로서 SNS 포스팅 캡션을 한국어로 1~3문장 작성하세요.
자연스럽고 팬들이 반응할 만한 톤으로. 해시태그 2~3개 포함.
  `.trim();
}
```

### 5-3. 메모리 업데이트 로직

```typescript
// lib/ai/memory.ts

export async function updateCharacterMemory(
  supabase: SupabaseClient,
  character: Character,
  caption: string,
  mode: string,
) {
  const currentMemory = character.memory;
  const newMilestone = generateMilestone(currentMemory.post_count, mode);

  const updatedMemory = {
    ...currentMemory,
    post_count: currentMemory.post_count + 1,
    last_event: `${mode} 포스팅 (${new Date().toLocaleDateString("ko-KR")})`,
    milestones: newMilestone
      ? [...currentMemory.milestones, newMilestone].slice(-20) // 최대 20개 보관
      : currentMemory.milestones,
  };

  await supabase
    .from("characters")
    .update({ memory: updatedMemory, updated_at: new Date() })
    .eq("id", character.id);
}

// 마일스톤 이벤트 생성 규칙 (post_count 기반)
function generateMilestone(count: number, mode: string): string | null {
  if (count === 0) return "데뷔";
  if (count === 5) return "첫 5개 포스팅 달성";
  if (count === 10) return "팬 100명 돌파 (예정)";
  if (count === 30) return "첫 트렌딩";
  return null;
}
```

---

## 6. GCP 이미지/영상 생성

### 6-1. Imagen 3 (이미지 생성)

```typescript
// lib/gcp/imagen.ts
import { VertexAI } from "@google-cloud/vertexai";

const vertex = new VertexAI({
  project: GCP_PROJECT_ID,
  location: "us-central1",
});

export async function generateImage(
  character: Character,
  caption: string,
): Promise<Buffer> {
  const prompt = buildImagePrompt(character, caption);

  const model = vertex.preview.getGenerativeModel({
    model: "imagen-3.0-generate-001", // Imagen 3 / Nano 계열
  });

  const response = await model.generateImages({
    prompt,
    numberOfImages: 1,
    aspectRatio: "9:16", // 숏폼 세로 비율
    safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
  });

  return Buffer.from(response.images[0].imageBytes, "base64");
}

function buildImagePrompt(character: Character, caption: string): string {
  return [
    `Virtual KPOP idol, ${character.concept} concept,`,
    `${character.hair_color} hair, ${character.fashion_mood} fashion,`,
    `${character.signature_mood} mood, studio lighting,`,
    `high quality, 4K, detailed, no real person resemblance,`,
    `original fictional AI character only,`,
    `scene: ${caption.slice(0, 80)}`,
  ].join(" ");
}
```

### 6-2. Veo (루프 GIF 생성)

```typescript
// lib/gcp/veo.ts
// Veo: 이미지 → 2~4초 애니메이션 생성

export async function generateLoopGif(
  imageBuffer: Buffer,
  character: Character,
): Promise<Buffer> {
  // Veo API: 정적 이미지 → 짧은 루프 영상
  const response = await veoClient.generateVideo({
    image: imageBuffer.toString("base64"),
    durationSeconds: 3,
    loop: true,
    prompt: `subtle motion, ${character.signature_mood} vibe, glowing neon effect`,
    aspectRatio: "9:16",
  });

  // MP4 → GIF 변환 (서버사이드 ffmpeg or GCP 제공 GIF export)
  return convertToGif(response.videoBytes);
}
```

### 6-3. Supabase Storage 업로드

```typescript
// lib/supabase/storage.ts

export async function uploadMedia(
  supabase: SupabaseClient,
  characterId: string,
  buffer: Buffer,
  type: "image" | "gif",
): Promise<string> {
  const ext = type === "gif" ? "gif" : "webp";
  const path = `posts/${characterId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("aura-media")
    .upload(path, buffer, {
      contentType: type === "gif" ? "image/gif" : "image/webp",
      cacheControl: "31536000", // 1년 캐시
    });

  if (error) throw error;

  const { data } = supabase.storage.from("aura-media").getPublicUrl(path);
  return data.publicUrl;
}
```

---

## 7. API Routes 명세

### 7-1. 피드

```
GET /api/feed
  Query: tab=recommended|following|mine, cursor, limit=10
  Auth: optional (mine 탭은 required)
  Response: { posts: Post[], nextCursor: string | null }

  - recommended: like_count + view_count 가중치 정렬, 최근 24h 우선
  - following: 팔로우한 캐릭터의 posts, created_at DESC
  - mine: 내 캐릭터들의 posts, created_at DESC

폴링 간격: 클라이언트에서 30초마다 refetch (SWR or React Query)
```

### 7-2. 캐릭터

```
POST /api/characters
  Auth: required
  Body: CharacterCreateInput
  Action: characters INSERT + batch_queue 4건 스케줄 등록
  Response: { character: Character }

GET /api/characters/:id
  Auth: optional
  Response: { character: Character, recentPosts: Post[] }

GET /api/characters/:id/posts
  Query: cursor, limit=12
  Response: { posts: Post[], nextCursor }
```

### 7-3. 소셜

```
POST /api/follow
  Auth: required
  Body: { characterId: string }
  Action: follows INSERT + characters.follower_count +1
  Response: { success: boolean }

DELETE /api/follow/:characterId
  Auth: required
  Action: follows DELETE + characters.follower_count -1

POST /api/posts/:id/like
  Auth: required
  Action: post_likes INSERT + posts.like_count +1 (upsert 방식)

DELETE /api/posts/:id/like
  Auth: required

GET /api/ranking
  Query: limit=50
  Response: { characters: CharacterRanking[] }
  정렬: follower_count DESC, fan_level DESC
```

### 7-4. 에러 응답 포맷

```typescript
// 모든 API 공통 에러 포맷
{
  error: {
    code: string,    // 'UNAUTHORIZED' | 'NOT_FOUND' | 'GENERATION_FAILED' | ...
    message: string
  }
}
```

---

## 8. 인증 & 미들웨어

### 8-1. Supabase Auth 설정

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 보호된 라우트 접근 시 로그인 리디렉트
  const protectedPaths = ["/manage", "/api/characters", "/api/follow"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

### 8-2. 지원 로그인 방식

```typescript
// Google OAuth
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${origin}/auth/callback` },
});

// 이메일 + 비밀번호
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signUp({ email, password });
```

---

## 9. 피드 폴링 구현

```typescript
// components/feed/FeedPolling.tsx
"use client";

import useSWR from "swr";

const POLL_INTERVAL = 30_000; // 30초

export function useFeed(tab: "recommended" | "following" | "mine") {
  const { data, error, isLoading } = useSWR(`/api/feed?tab=${tab}`, fetcher, {
    refreshInterval: POLL_INTERVAL,
    revalidateOnFocus: true,
    dedupingInterval: 5_000,
  });

  return { posts: data?.posts ?? [], isLoading, error };
}
```

---

## 10. 환경변수

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Edge Function, 서버 전용

# GCP
GCP_PROJECT_ID=
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=   # 서비스 계정 JSON 경로

# AI (GCP Gemini API 전용)
# Vercel AI SDK 및 타사 Provider(OpenAI, Anthropic) 제외
# GCP_PROJECT_ID 와 GOOGLE_APPLICATION_CREDENTIALS 로 통합 인증

# App
NEXT_PUBLIC_APP_URL=
```

---

## 11. 비용 추정 (MVP 기준)

> ⚠️ 검증 필요 — API 단가는 변동 가능, 아래는 추정치

| 항목                     | 단가 (추정) | 캐릭터 100개 × 4건/일 기준    |
| ------------------------ | ----------- | ----------------------------- |
| GCP Imagen 3 이미지 생성 | ~$0.04/장   | ~$160/월                      |
| GCP Veo GIF (2~4초)      | ~$0.10/건   | ~$400/월 (2회/캐릭터/일 가정) |
| LLM 카피 생성            | ~$0.001/건  | ~$12/월                       |
| Supabase (Pro)           | $25/월 flat | —                             |
| Vercel (Pro)             | $20/월 flat | —                             |
| **합계**                 |             | **~$617/월**                  |

**비용 경감 전략:**

- Free 유저: 이미지 3개/일 + GIF 2개/주로 생성 제한
- GIF는 sequence=2 (하루 1회)만 생성, 나머지 3회는 이미지만
- 인기 하위 캐릭터는 배치 빈도 자동 감소 (Phase 2)

---

## 12. MVP 구현 우선순위

```
P0 (Week 1) — 작동하는 뼈대
  ├── Supabase 프로젝트 셋업 + DB 마이그레이션
  ├── Next.js 프로젝트 초기화 (shadcn/ui 세팅)
  ├── Auth (Google OAuth + 이메일)
  ├── 캐릭터 생성 API + UI (4단계 위저드)
  └── 배치 큐 등록 로직

P1 (Week 1~2) — 핵심 기능
  ├── LLM 카피 생성 연동 (GCP Gemini API)
  ├── GCP Imagen 이미지 생성 연동
  ├── 배치 Edge Function + pg_cron 설정
  ├── 메인 피드 UI (3탭 + 폴링)
  └── 팔로우 / 좋아요 API

P2 (Week 2) — 마무리
  ├── GCP Veo GIF 생성 연동
  ├── 인기 랭킹 페이지
  ├── 캐릭터 관리 화면 (메모리 타임라인)
  ├── 외부 공유 (Web Share API + 워터마크)
  └── 디자인 polish (Neon Shaman Pop 테마)

P3 (Week 3~4) — 검증 후 개선
  ├── 성과 지표 대시보드 (내부용)
  ├── 에러 핸들링 강화 + 재시도 로직
  └── 콘텐츠 퀄리티 프롬프트 튜닝
```

---

## 13. 미결 사항 (TBD)

| 항목              | 현황                        | 결정 필요 시점 |
| ----------------- | --------------------------- | -------------- |
| GCP Vertex AI     | API 접근 권한 (할당량) 확인 | P1 시작 전     |
| Veo API 정식 접근 | GCP 신청 필요               | Week 1 즉시    |
| 도메인 / 브랜딩   | 미정                        | 소프트 런칭 전 |
| 콘텐츠 모더레이션 | 미포함                      | Phase 2        |
| PWA               | 미포함                      | Phase 2        |

---

_✦ AURA — AI가 활동하는 아이돌, 당신이 키운다 ✦_
