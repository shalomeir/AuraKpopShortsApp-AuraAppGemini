# Memory Bank (Session Context)

## Project Name: Aura (AI KPOP 아이돌 가상 소셜 플랫폼)

### 진행 완료 사항 (MVP v0.1 기준)

1. **Next.js & 기본 환경 셋업**:
   - App Router, TypeScript, Tailwind CSS 적용
   - shadcn/ui 초기화
   - Supabase(SSR & Client), AI SDKs 뼈대 등 패키지 설치
2. **도메인 타입 정의 (`src/types`)**:
   - `Character`, `Post`, `CharacterRanking` 타입 선언 (AURA TRD 기반)
3. **가상 데이터 Mocking 구현 (`src/lib/mockData.ts`)**:
   - `DummyJSON` 데이터를 변형하여 KPOP 아이돌 앱 성격에 맞게 변환
   - `Unsplash API`(이미지) 및 `Pexels API`(동영상) 연동을 통해 목업 미디어(사진/세로형 영상) 생성 처리 구축 (API Key 존재 시 실제 호출, Fallback 지원)
4. **환경 설정 가이드 셋업**:
   - `.env.example` 작성: Supabase, GCP, AI Provider(Anthropic/OpenAI/Google), 미디어 API(Unsplash/Pexels) Key 정보 안내
5. **GCP, Supabase, Vercel 연동 완료**:
   - GCP 프로젝트(`aura-kpop-gemini`) 생성 및 결제 프로필($300 크레딧) 연동 확인 완료
   - 로컬 `application-default` 터미널 인증(`ADC`) 기반의 GCP Vertex AI SDK 셋업 완료
   - 하위 버전(1.5) 대신 최신형 **Gemini 2.5 Flash / 2.0 Flash** 모델 연동 및 통신 테스트 100% 통과
   - Vercel 앱 환경 및 Supabase 리모트 저장소 연동 정상화 확인
6. **서버/API 1차 구현 (Supabase 기반)**:
   - `src/lib/supabase/{client,server,admin}.ts` 추가
   - `src/app/api/feed/route.ts`
   - `src/app/api/characters/route.ts`, `src/app/api/characters/[id]/route.ts`
   - `src/app/api/ranking/route.ts`
   - `src/app/api/follow/route.ts`
   - `src/app/api/posts/[id]/like/route.ts`
7. **인증 플로우 개선**:
   - `src/app/auth/callback/route.ts` 추가
   - `login/profile` 페이지를 localStorage mock에서 Supabase 세션 기반으로 변경
8. **DB/문서/배포 설정 보강**:
   - `supabase/migrations/20260228162000_init_aura.sql` 추가
   - OpenAPI 문서 `docs/openapi.yaml` 추가
   - `README.md`, `.env.example`, `vercel.json` 업데이트
9. **생성형 API 3종 신설 (2026-02-28)**:
   - worktree 브랜치 `feature/vertex-character-gen-api`에서 분리 개발
   - Fastify 분리 서비스 대신 **Next.js Route Handler**로 통합
   - `POST /api/ai/character-generate`: PRD Step1~4 입력 기반 Vertex Gemini 캐릭터 생성
   - `POST /api/ai/activity-manage`: 캐릭터 활동 계획 생성 + `characters`/`batch_queue` 반영
   - `POST /api/ai/post-content-generate`: 최종 포스팅 캡션/프롬프트 생성 + `posts` draft 저장
   - 모델 정책 적용:
     - 단순 분류 `gemini-3-flash`
     - 추론/카피 `gemini-3.1-pro`
     - 이미지 `nano-banana-2`
     - 영상 `veo-3-fast`
     - 음악/음성 `lyria-3`(fallback `lyria-2`)
   - 미디어 파이프라인 정책:
     - 밈 루프는 `nano-banana-2` GIF 루프
     - 긴 영상은 `nano-banana-2` 이미지 생성 후 `veo-3-fast` image-to-video
   - 모든 미디어 계획에 face/persona consistency lock 포함
   - 생성 결과를 Supabase Storage(`character-generations`)에 JSON 업로드
   - 메타데이터 테이블(`character_generations`) 기록 옵션 지원
   - OpenAPI/README/환경변수/SQL 가이드(`docs/character-gen-supabase.sql`) 반영
   - 별도 문서 `docs/generative-ai-apis.md`에 API 설명 및 호출당 비용 추정 정리
10. **자동 포스팅 정책 구현 (2026-02-28)**:
   - 캐릭터 생성 직후: 즉시 2개 + 1시간 뒤 1개(첫날 총 3개)
   - 다음날부터: 캐릭터당 매일 2개 큐 생성
   - 전날 미접속 유저의 모든 캐릭터 자동 포스팅 중단(`is_active=false`)
   - 중단 캐릭터는 `POST /api/ai/post-content-generate`에서 `POSTING_PAUSED` 차단
   - 내부 자동화 API `POST /api/internal/automation/daily-posting` 추가
   - 접속 추적 컬럼 `profiles.last_seen_at` 및 인덱스 마이그레이션 추가
   - 정책 문서 `docs/posting-activity-policy.md` 추가

### 다음 단계 진행을 위한 Todo 연동

현시점의 전체적인 개발 할 일(Todo)은 항상 루트 디렉토리의 `todo.md` 파일을 참조하고 업데이트합니다.
현재 가장 우선순위가 높은 P0 작업들은 모두 끝났으며, MVP 주요 핵심 기능인 아래 내용을 진행해야 합니다.

- **Auth 마무리**: 이메일 로그인/회원가입, 보호 라우트 미들웨어
- **캐릭터 생성 UI**: 4단계 위저드와 `/api/ai/character-generate` 연동
- **활동/콘텐츠 운영 UI**: `/api/ai/activity-manage`, `/api/ai/post-content-generate` 연동
- **운영 자동화 연결**: `daily-posting` 내부 API를 Vercel Cron으로 1일 1회 호출
- **피드 데이터 소스 전환**: mockData -> `/api/feed` 실제 API 연동

### 에이전트 인계 지침

- 새로운 세션 시작 시 **우선적으로 이 파일(`memory.md`)과 `todo.md`를 열람**하여 이전 작업 현황을 파악하고 맥락(context)을 이어간다.
- Next.js 실행 포트는 항상 `3000`번이다.
- Agent.md, GEMINI.md, `.cursor/rules` 등 에이전트 및 서비스 정책에 관련된 파일 규칙을 준수한다.
- 서버 API 변경 시 `docs/openapi.yaml`, `todo.md`, `memory.md`를 함께 갱신한다.
