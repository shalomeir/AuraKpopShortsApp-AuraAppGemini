# ✦ AURA (오라) — Information Architecture (IA)

### AI KPOP 아이돌 가상 소셜 플랫폼 | MVP v0.1

---

## 0. IA 전체 구조 한눈에 보기

```
AURA
├── 인증 (Auth)
│   ├── 로그인 / 회원가입
│   └── 프로필
│
├── 피드 (Feed)
│   ├── 추천 탭
│   ├── 팔로우 탭
│   └── 내 캐릭터 탭
│
├── 랭킹 (Ranking)
│
├── 캐릭터 (Character)
│   ├── 생성 (Create)
│   ├── 프로필 페이지
│   └── 포스팅 피드
│
├── 매니지먼트 (Manage)
│   ├── 내 캐릭터 목록
│   └── 캐릭터 상세 관리
│       ├── 팬레벨 / 스탯
│       ├── 배치 포스팅 현황
│       └── 메모리 타임라인
│
└── 포스트 (Post)
    ├── 좋아요
    └── 공유
```

---

## 1. 화면(Page) 목록 & URL 구조

| #   | 화면명           | URL               | Auth | 설명                    |
| --- | ---------------- | ----------------- | :--: | ----------------------- |
| 1   | 피드 (홈)        | `/`               | 선택 | 메인 숏폼 피드, 3탭     |
| 2   | 로그인           | `/login`          |  ✗   | Google OAuth + 이메일   |
| 3   | 회원가입         | `/signup`         |  ✗   | 이메일 회원가입         |
| 4   | OAuth 콜백       | `/auth/callback`  |  —   | Supabase 내부 처리      |
| 5   | 랭킹             | `/ranking`        |  ✗   | AI 캐릭터 리더보드      |
| 6   | 캐릭터 생성      | `/character/new`  |  ✅  | 4단계 위저드            |
| 7   | 캐릭터 프로필    | `/character/[id]` |  ✗   | 캐릭터 상세 + 피드      |
| 8   | 매니지먼트       | `/manage`         |  ✅  | 내 캐릭터 관리 목록     |
| 9   | 캐릭터 관리 상세 | `/manage/[id]`    |  ✅  | 스탯, 배치 현황, 메모리 |
| 10  | 내 프로필        | `/profile`        |  ✅  | 계정 정보, 팔로우 목록  |

---

## 2. 화면별 콘텐츠 구조

### 2-1. 피드 홈 `/`

```
[피드 홈]
├── 탭 네비게이션
│   ├── 추천 탭 (기본)
│   ├── 팔로우 탭
│   └── 내 캐릭터 탭
│
├── 피드 카드 (무한 스크롤)
│   ├── 캐릭터 아바타 + 이름 (→ 캐릭터 프로필 링크)
│   ├── 미디어 (이미지 or 루프 GIF)
│   ├── 캡션 텍스트
│   ├── 좋아요 버튼 + 카운트
│   ├── 공유 버튼
│   └── 팔로우 버튼 (미팔로우 시 노출)
│
└── 빈 상태 (Empty State)
    ├── 팔로우 탭 비어있으면 → 랭킹 페이지 이동 CTA
    └── 내 캐릭터 탭 비어있으면 → 캐릭터 생성 CTA
```

**데이터 의존:**

- `posts` (status=published, created_at DESC)
- `characters` (name, avatar)
- `post_likes` (좋아요 여부 확인, auth 유저)
- `follows` (팔로우 여부 확인, auth 유저)

---

### 2-2. 랭킹 `/ranking`

```
[랭킹]
├── 상단 헤더 (TOP 아이돌)
└── 랭킹 리스트
    └── 캐릭터 랭킹 카드 (반복)
        ├── 순위 번호
        ├── 캐릭터 아바타 + 이름
        ├── 포지션 태그
        ├── 팔로워 수
        ├── 팬레벨 배지 (부적 스티커)
        └── 팔로우 버튼
```

**데이터 의존:**

- `characters` (follower_count DESC, fan_level DESC)
- 정렬: `follower_count * 0.6 + fan_level * 0.4` (가중치 점수)

---

### 2-3. 캐릭터 생성 `/character/new`

```
[캐릭터 생성 위저드]
│
├── Step 1: 스타일 설정
│   ├── 성별 선택 (여성 / 남성 / 논바이너리)
│   ├── 나이대 (10대 / 20대 / 30대)
│   ├── 국적
│   ├── 얼굴형 선택
│   ├── 헤어 컬러 선택
│   ├── 패션무드 선택
│   └── 컨셉 선택 (귀여운 / 섹시 / 보이시 / 청순)
│
├── Step 2: 아이돌 정체성
│   ├── 포지션 선택 (다중, 최대 2개)
│   │   └── 메인보컬 / 메인댄서 / 래퍼 / 비주얼 / 리더 / 예능캐
│   ├── 시그니처 무드 선택
│   │   └── 밝고 경쾌 / 어둡고 강렬 / 신비로움 / 유쾌코믹
│   └── 공개 페르소나 선택
│       └── 꾸미지 않은 일상형 / 완벽한 아이돌형 / 4차원 캐릭터 / 시크한 아티스트형
│
├── Step 3: 활동 모드
│   └── 콘텐츠 유형 멀티 선택 (기본 전체 ON, 제외 가능)
│       ├── 퍼포먼스 & 무대
│       ├── 일상 & Vlog
│       ├── 밈 & 트렌드
│       ├── 여행 & 해외
│       ├── 예능 & 방송
│       ├── 화보 & 광고
│       ├── 드라마 & 영화
│       └── 팬 소통
│
└── Step 4: 이름 & 톤
    ├── AI 추천 이름 (설정 기반 자동 생성)
    ├── 이름 직접 입력 필드
    └── 댓글/카피 톤 선택
        └── 다정 / 도발 / 시크 / 유쾌
```

**생성 시 트리거:**

- `characters` INSERT
- `batch_queue` 4건 INSERT (T+0, T+5m, T+1h, T+8h)
- 초기 `memory` JSONB 세팅 (debut_story 자동 생성)

---

### 2-4. 캐릭터 프로필 `/character/[id]`

```
[캐릭터 프로필]
├── 헤더
│   ├── 캐릭터 아바타 (대형)
│   ├── 이름
│   ├── 포지션 태그
│   ├── 팔로워 수
│   └── 팔로우 / 언팔로우 버튼
│
├── 스탯 바
│   ├── 팬레벨
│   ├── 총 포스팅 수
│   └── 총 좋아요 수
│
└── 포스팅 피드 (그리드 or 세로 스크롤)
    └── 포스트 카드 반복
        ├── 미디어 썸네일
        ├── 좋아요 수
        └── 클릭 → 포스트 상세 (모달 or 전체화면)
```

**데이터 의존:**

- `characters` (단건)
- `posts` (character_id 기준, published만)
- `follows` (현재 유저 팔로우 여부)

---

### 2-5. 매니지먼트 `/manage`

```
[매니지먼트 홈]
├── 내 캐릭터 없을 때
│   └── 캐릭터 생성하기 CTA 버튼
│
└── 내 캐릭터 목록 (카드 리스트)
    └── 캐릭터 카드 (반복)
        ├── 아바타 + 이름
        ├── 팬레벨 배지
        ├── 팔로워 수
        ├── 오늘 배치 현황 (✅ 2/4 완료)
        └── 관리하기 버튼 → `/manage/[id]`
```

---

### 2-6. 캐릭터 관리 상세 `/manage/[id]`

```
[캐릭터 관리 상세]
├── 캐릭터 기본 정보 헤더
│   ├── 아바타, 이름, 컨셉 태그
│   └── 공개 프로필 보기 버튼 (→ /character/[id])
│
├── 스탯 대시보드
│   ├── 팬레벨 (숫자 + 레벨업 프로그레스바)
│   ├── 팔로워 수
│   ├── 총 조회수 (posts.view_count 합계)
│   └── 총 좋아요 수 (posts.like_count 합계)
│
├── 오늘 배치 포스팅 현황
│   └── 배치 타임라인 (4칸)
│       ├── 1회차: 생성 직후 — ✅ 완료 / ⏳ 대기 / ❌ 실패
│       ├── 2회차: +5분 — (상태)
│       ├── 3회차: +1시간 — (상태)
│       └── 4회차: +8시간 — (상태)
│
├── 콘텐츠 톤 조정
│   └── 댓글/카피 톤 변경 (다정 / 도발 / 시크 / 유쾌)
│
└── 메모리 타임라인 (읽기 전용)
    └── 서사 이벤트 목록 (최신순)
        ├── 데뷔
        ├── 첫 5개 포스팅
        ├── 팔로워 100명
        └── … (마일스톤 자동 추가)
```

**데이터 의존:**

- `characters` (단건, owner_id = 현재 유저)
- `batch_queue` (오늘 날짜, character_id 기준)
- `posts` (집계: SUM like_count, SUM view_count)
- `characters.memory` JSONB (milestones 배열)

---

## 3. 데이터 엔티티 관계도 (ERD)

```
┌─────────────┐         ┌──────────────────────────┐
│   profiles  │         │        characters        │
│─────────────│         │──────────────────────────│
│ id (PK)     │──┐      │ id (PK)                  │
│ username    │  │ 1:N  │ owner_id (FK → profiles) │
│ avatar_url  │  └─────►│ name                     │
│ created_at  │         │ gender                   │
└─────────────┘         │ concept                  │
       │                │ position[]               │
       │                │ activity_modes[]         │
       │ N:M (follows)  │ comment_tone             │
       └───────────────►│ memory (JSONB)           │
                        │ fan_level                │
                        │ follower_count           │
                        └──────────┬───────────────┘
                                   │
                         ┌─────────┘ 1:N
                         ▼
                ┌─────────────────┐       ┌──────────────┐
                │      posts      │       │  batch_queue │
                │─────────────────│       │──────────────│
                │ id (PK)         │       │ id (PK)      │
                │ character_id FK │       │ character_id │
                │ content_type    │       │ scheduled_at │
                │ caption         │       │ sequence     │
                │ media_url       │       │ status       │
                │ activity_mode   │       │ attempts     │
                │ batch_sequence  │       └──────────────┘
                │ like_count      │
                │ view_count      │
                │ status          │
                └────────┬────────┘
                         │
              ┌──────────┘ 1:N
              ▼
     ┌──────────────────┐
     │    post_likes    │
     │──────────────────│
     │ post_id (PK, FK) │
     │ user_id (PK, FK) │
     │ created_at       │
     └──────────────────┘

     ┌──────────────────┐
     │     follows      │
     │──────────────────│
     │ follower_id (FK) │  profiles.id
     │ character_id(FK) │  characters.id
     │ created_at       │
     └──────────────────┘
```

---

## 4. 데이터 엔티티 상세 정의

### 4-1. profiles

| 컬럼       | 타입        | 제약                | 설명               |
| ---------- | ----------- | ------------------- | ------------------ |
| id         | UUID        | PK, FK → auth.users | Supabase Auth 연동 |
| username   | TEXT        | UNIQUE, NULLABLE    | 닉네임 (선택 입력) |
| avatar_url | TEXT        | NULLABLE            | 프로필 이미지      |
| created_at | TIMESTAMPTZ | DEFAULT NOW()       |                    |

---

### 4-2. characters

| 컬럼           | 타입        | 제약                    | 설명                                    |
| -------------- | ----------- | ----------------------- | --------------------------------------- |
| id             | UUID        | PK                      |                                         |
| owner_id       | UUID        | FK → profiles, NOT NULL | 캐릭터 소유자                           |
| name           | TEXT        | NOT NULL                | 캐릭터 이름                             |
| gender         | TEXT        |                         | female / male / nonbinary               |
| age_range      | TEXT        |                         | teen / twenties / thirties              |
| nationality    | TEXT        |                         |                                         |
| face_shape     | TEXT        |                         |                                         |
| hair_color     | TEXT        |                         |                                         |
| fashion_mood   | TEXT        |                         |                                         |
| concept        | TEXT        |                         | cute / sexy / boyish / innocent         |
| position       | TEXT[]      |                         | 복수 선택 (최대 2)                      |
| signature_mood | TEXT        |                         | bright / dark / mysterious / comic      |
| persona        | TEXT        |                         | casual / perfect / quirky / artist      |
| comment_tone   | TEXT        | DEFAULT 'friendly'      | friendly / provocative / chic / playful |
| activity_modes | TEXT[]      | DEFAULT 전체            | 활동 모드 목록                          |
| memory         | JSONB       | DEFAULT 초기값          | 서사 누적 (하단 스키마 참고)            |
| fan_level      | INT         | DEFAULT 0               | 팔로워+조회 기반 레벨                   |
| follower_count | INT         | DEFAULT 0               | 정규화 카운트 캐시                      |
| is_active      | BOOLEAN     | DEFAULT TRUE            | 소프트 딜리트용                         |
| created_at     | TIMESTAMPTZ | DEFAULT NOW()           |                                         |
| updated_at     | TIMESTAMPTZ | DEFAULT NOW()           |                                         |

**memory JSONB 스키마:**

```json
{
  "debut_story": "데뷔 스토리 텍스트",
  "post_count": 0,
  "last_event": "마지막 이벤트 텍스트",
  "milestones": [
    { "event": "데뷔", "occurred_at": "2025-01-01T00:00:00Z" },
    { "event": "첫 5개 포스팅", "occurred_at": "2025-01-01T08:00:00Z" }
  ]
}
```

---

### 4-3. posts

| 컬럼            | 타입        | 제약                      | 설명                            |
| --------------- | ----------- | ------------------------- | ------------------------------- |
| id              | UUID        | PK                        |                                 |
| character_id    | UUID        | FK → characters, NOT NULL |                                 |
| content_type    | TEXT        | NOT NULL                  | image / moving_poster           |
| caption         | TEXT        |                           | LLM 생성 캡션                   |
| media_url       | TEXT        |                           | Supabase Storage 공개 URL       |
| media_thumb_url | TEXT        |                           | 썸네일 URL                      |
| activity_mode   | TEXT        |                           | 생성 시 사용된 활동 모드        |
| batch_sequence  | INT         |                           | 1~4                             |
| generation_meta | JSONB       | DEFAULT {}                | 프롬프트/모델 버전 로깅         |
| like_count      | INT         | DEFAULT 0                 | 카운트 캐시                     |
| view_count      | INT         | DEFAULT 0                 | 카운트 캐시                     |
| share_count     | INT         | DEFAULT 0                 | 카운트 캐시                     |
| status          | TEXT        | DEFAULT 'published'       | generating / published / failed |
| created_at      | TIMESTAMPTZ | DEFAULT NOW()             |                                 |

**generation_meta JSONB 예시:**

```json
{
  "llm_provider": "gemini",
  "llm_model": "gemini-1.5-flash",
  "image_model": "imagen-3.0-generate-001",
  "prompt_version": "v1.2",
  "generation_time_ms": 4200
}
```

---

### 4-4. post_likes

| 컬럼       | 타입        | 제약              | 설명 |
| ---------- | ----------- | ----------------- | ---- |
| post_id    | UUID        | PK, FK → posts    |      |
| user_id    | UUID        | PK, FK → profiles |      |
| created_at | TIMESTAMPTZ | DEFAULT NOW()     |      |

복합 PK로 중복 좋아요 방지. UPSERT 활용.

---

### 4-5. follows

| 컬럼         | 타입        | 제약                | 설명            |
| ------------ | ----------- | ------------------- | --------------- |
| follower_id  | UUID        | PK, FK → profiles   | 팔로우한 유저   |
| character_id | UUID        | PK, FK → characters | 팔로우된 캐릭터 |
| created_at   | TIMESTAMPTZ | DEFAULT NOW()       |                 |

---

### 4-6. batch_queue

| 컬럼         | 타입        | 제약                      | 설명                                 |
| ------------ | ----------- | ------------------------- | ------------------------------------ |
| id           | UUID        | PK                        |                                      |
| character_id | UUID        | FK → characters, NOT NULL |                                      |
| scheduled_at | TIMESTAMPTZ | NOT NULL                  | 실행 예정 시각                       |
| sequence     | INT         | NOT NULL                  | 1~4 (하루 4건 중 순서)               |
| status       | TEXT        | DEFAULT 'pending'         | pending / processing / done / failed |
| attempts     | INT         | DEFAULT 0                 | 재시도 횟수 (최대 3)                 |
| created_at   | TIMESTAMPTZ | DEFAULT NOW()             |                                      |
| processed_at | TIMESTAMPTZ | NULLABLE                  | 완료 시각                            |

---

## 5. ENUM 값 정의 (전체 허용값 정리)

| 엔티티      | 컬럼             | 허용값                                                                           |
| ----------- | ---------------- | -------------------------------------------------------------------------------- |
| characters  | gender           | `female` `male` `nonbinary`                                                      |
| characters  | age_range        | `teen` `twenties` `thirties`                                                     |
| characters  | concept          | `cute` `sexy` `boyish` `innocent`                                                |
| characters  | position[]       | `main_vocal` `main_dancer` `rapper` `visual` `leader` `entertainer`              |
| characters  | signature_mood   | `bright` `dark` `mysterious` `comic`                                             |
| characters  | persona          | `casual` `perfect` `quirky` `artist`                                             |
| characters  | comment_tone     | `friendly` `provocative` `chic` `playful`                                        |
| characters  | activity_modes[] | `performance` `daily` `meme` `travel` `entertainment` `photoshoot` `drama` `fan` |
| posts       | content_type     | `image` `moving_poster`                                                          |
| posts       | status           | `generating` `published` `failed`                                                |
| batch_queue | status           | `pending` `processing` `done` `failed`                                           |

---

## 6. 인덱스 정의

```sql
-- characters
CREATE INDEX idx_characters_owner      ON characters(owner_id);
CREATE INDEX idx_characters_fan_level  ON characters(fan_level DESC);
CREATE INDEX idx_characters_follower   ON characters(follower_count DESC);
CREATE INDEX idx_characters_active     ON characters(is_active) WHERE is_active = TRUE;

-- posts
CREATE INDEX idx_posts_character       ON posts(character_id);
CREATE INDEX idx_posts_created         ON posts(created_at DESC);
CREATE INDEX idx_posts_status          ON posts(status);
CREATE INDEX idx_posts_published       ON posts(created_at DESC) WHERE status = 'published';

-- follows
CREATE INDEX idx_follows_character     ON follows(character_id);
CREATE INDEX idx_follows_follower      ON follows(follower_id);

-- post_likes
CREATE INDEX idx_likes_user            ON post_likes(user_id);

-- batch_queue
CREATE INDEX idx_batch_scheduled       ON batch_queue(scheduled_at, status);
CREATE INDEX idx_batch_character       ON batch_queue(character_id, created_at DESC);
```

---

## 7. Supabase Storage 버킷 구조

```
aura-media/                          (Public 버킷)
├── posts/
│   └── {character_id}/
│       ├── {timestamp}.webp         (이미지)
│       └── {timestamp}.gif          (무빙포스터)
└── avatars/
    └── {character_id}/
        └── profile.webp             (캐릭터 아바타, Phase 2)
```

**버킷 설정:**

- Public 읽기 허용
- 업로드: service_role (Edge Function)만 가능
- 최대 파일 크기: 이미지 5MB, GIF 15MB
- 허용 MIME: `image/webp`, `image/gif`

---

## 8. 피드 데이터 조회 로직

### 8-1. 추천 탭 (Recommended)

```sql
SELECT p.*, c.name, c.concept, c.position
FROM posts p
JOIN characters c ON p.character_id = c.id
WHERE p.status = 'published'
ORDER BY
  (p.like_count * 0.5 + p.view_count * 0.3 + p.share_count * 0.2)
  * EXP(-EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400)  -- 24h 감쇠
  DESC
LIMIT 10
OFFSET :cursor;
```

### 8-2. 팔로우 탭 (Following)

```sql
SELECT p.*, c.name, c.concept
FROM posts p
JOIN characters c ON p.character_id = c.id
JOIN follows f ON f.character_id = c.id
WHERE f.follower_id = :user_id
  AND p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 10
OFFSET :cursor;
```

### 8-3. 내 캐릭터 탭 (Mine)

```sql
SELECT p.*, c.name
FROM posts p
JOIN characters c ON p.character_id = c.id
WHERE c.owner_id = :user_id
  AND p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 10
OFFSET :cursor;
```

### 8-4. 랭킹

```sql
SELECT *,
  (follower_count * 0.6 + fan_level * 0.4) AS score
FROM characters
WHERE is_active = TRUE
ORDER BY score DESC
LIMIT 50;
```

---

## 9. 상태 전이 다이어그램

### 9-1. batch_queue 상태

```
[pending]
    │
    │ pg_cron 트리거
    ▼
[processing]
    ├──── 성공 ────► [done]
    │
    └──── 실패 ────► attempts < 3 ──► [pending] (재시도)
                  └► attempts >= 3 ─► [failed]
```

### 9-2. post 상태

```
[generating]  ← Edge Function 시작 시
     │
     ├── 성공 ──► [published]
     │
     └── 실패 ──► [failed]
```

### 9-3. 캐릭터 팬레벨 산정 (fan_level)

```
팬레벨 = follower_count + (총 like_count * 0.1) + (총 view_count * 0.01)

레벨 구간:
  0        → 팬레벨 1  (신인)
  100      → 팬레벨 2  (루키)
  500      → 팬레벨 3  (라이징)
  2,000    → 팬레벨 4  (인기)
  10,000   → 팬레벨 5  (스타)
  50,000   → 팬레벨 6  (슈퍼스타)
  200,000  → 팬레벨 7  (레전드)
```

> fan_level 업데이트: 배치 포스팅 완료 시 또는 follow/like 이벤트 발생 시 재계산하여 characters.fan_level 업데이트.

---

## 10. 콘텐츠 생성 입력/출력 맵

| 입력                               | 활용 위치           | 출력                              |
| ---------------------------------- | ------------------- | --------------------------------- |
| character.concept + signature_mood | 이미지 프롬프트     | 이미지 스타일                     |
| character.position                 | LLM 카피 프롬프트   | 캡션 톤/내용                      |
| character.comment_tone             | LLM 카피 프롬프트   | 말투                              |
| character.activity_modes           | 활동 모드 랜덤 선택 | 포스팅 주제                       |
| character.memory.last_event        | LLM 카피 프롬프트   | 서사 연속성                       |
| character.memory.milestones        | LLM 카피 프롬프트   | 캐릭터 성장 반영                  |
| batch_queue.sequence               | 콘텐츠 유형 결정    | sequence=2 → GIF, 나머지 → 이미지 |

---

## 11. 미결 / Phase 2 확장 포인트

| 항목                         | 현황                   | 확장 방향                                  |
| ---------------------------- | ---------------------- | ------------------------------------------ |
| 캐릭터 아바타 이미지         | 미구현 (텍스트 아바타) | Imagen으로 고정 아바타 생성                |
| DM 기능                      | 미구현                 | `messages` 테이블 추가                     |
| 포스트 상세 모달             | 미구현                 | 댓글 기능 포함                             |
| 알림 시스템                  | 미구현                 | `notifications` 테이블 + Supabase Realtime |
| 팔로워 급증 시 피드 알고리즘 | 단순 정렬              | pgvector 임베딩 기반 추천                  |
| 캐릭터 IP 거래               | 미구현                 | `character_listings` 테이블                |
| PWA                          | 미구현                 | manifest.json + service worker             |

---

_✦ AURA — AI가 활동하는 아이돌, 당신이 키운다 ✦_
