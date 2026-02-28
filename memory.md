# Memory Bank (Session Context)

## Project Name: Aura (AI KPOP 아이돌 가상 소셜 플랫폼)

### 진행 완료 사항 (MVP v0.1 기준)

1. **Next.js & 기본 환경 셋업**:
   - App Router, TypeScript, Tailwind CSS 적용
   - shadcn/ui 초기화
   - Supabase(SSR & Client), AI SDKs 뼈대 등 패키지 설치
2. **도메인 타입 정의 (`src/types`)**:
   - `Character`, `Post`, `CharacterRanking` 타입 선언 (AURA TRD 기반)
3. **가상 데이터 Mocking 구현(초기 단계, 현재 제거됨)**:
   - 과거 `src/lib/mockData.ts` 기반 목업 데이터 파이프라인으로 초기 UI 개발 진행
   - 현재는 Supabase + Route Handler 기반으로 전환되어 mock 모듈 제거 완료
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
9. **Supabase 데이터 생성 안정화 (2026-02-28)**:
   - `src/lib/server/auth.ts`에서 인증 직후 `profiles` 자동 upsert 처리
   - `supabase/migrations/20260228183000_profile_bootstrap.sql` 추가:
     - `auth.users` 신규 생성 시 `public.profiles` 자동 생성 트리거
   - `README.md`를 실사용 기준으로 재작성:
     - 설치/실행/환경변수/Supabase DB 생성 및 마이그레이션 절차/데이터 생성 검증 방법 명시
   - `.env.example`의 로컬 앱 URL을 `http://localhost:3000`으로 정정
10. **Mock -> Supabase 데이터 소스 전환 (2026-02-28)**:
   - `src/app/page.tsx`: 피드 데이터를 `posts + characters` Supabase 조회로 전환
   - `src/app/character/[id]/page.tsx`: 캐릭터/게시물 조회를 Supabase로 전환 (존재하지 않으면 404)
   - `src/app/leaderboard/page.tsx`: 랭킹 데이터를 Supabase 정렬 쿼리로 전환
   - `src/app/manage/page.tsx`: 로그인 사용자 소유 캐릭터 목록 Supabase 조회
   - `src/app/manage/[id]/page.tsx`: 관리 상세 데이터를 Supabase 조회 및 batch_queue 표시
   - `src/app/create/page.tsx`: mock redirect 제거, `/api/characters` 실제 생성 호출로 전환
11. **개발용 Seed 데이터 추가 (2026-02-28)**:
   - `supabase/seeds/dev-seed.sql` 추가
   - `auth.users` 기반으로 `profiles`, `characters`, `posts`, `batch_queue`를 일괄 생성
   - `seed_tag=aura_dev_seed_v1`로 재실행 가능한 형태로 구성
   - `README.md`에 시드 실행 절차 문서화
12. **Mock 모듈 제거 완료 (2026-02-28)**:
   - `src/lib/mockData.ts` 삭제
   - 앱 주요 페이지 데이터 소스를 Supabase로 단일화
13. **피드 탭 동작 안정화 (2026-02-28)**:
   - `src/app/page.tsx`를 클라이언트 탭 상태 기반으로 전환
   - `/api/feed?tab=recommended|following|mine` 호출로 데이터 조회
   - `following`, `mine` 탭 비로그인 시 401 에러를 사용자 메시지로 처리
14. **Supabase Auth 구현 확장 (2026-02-28)**:
   - `src/app/login/page.tsx`:
     - Google OAuth 로그인
     - Email 로그인(`signInWithPassword`)
     - Email 회원가입(`signUp`) + 인증 링크 안내
   - `src/app/auth/callback/route.ts`:
     - OAuth `code` 교환
     - Email 인증 `token_hash`/`type` 검증(`verifyOtp`)
   - `src/middleware.ts` 추가:
     - `/create`, `/manage` 보호 라우트 적용 (비로그인 시 `/login?next=...` 리다이렉트)
   - `src/app/profile/page.tsx`:
     - 실제 로그인 사용자 이메일 및 auth state 표시
15. **클라이언트 env 주입 이슈 수정 (2026-02-28)**:
   - `src/lib/supabase/client.ts`에서 동적 env 접근(`process.env[name]`) 제거
   - Next.js 클라이언트 번들에 맞게 정적 접근(`process.env.NEXT_PUBLIC_SUPABASE_URL`)으로 수정
   - 결과: `/login`, `/profile` 탭의 `Missing required environment variable` 런타임 에러 해소
16. **Profile 탭 세션 판정 안정화 (2026-02-28)**:
   - `src/app/profile/page.tsx`를 서버 컴포넌트로 전환 (`auth.getUser()` 서버 판정)
   - `src/app/profile/auth-action-button.tsx` 분리 (클라이언트 로그아웃/로그인 액션)
   - 로그인 상태 반영 지연/불일치 문제를 줄이고 SSR 기준으로 사용자 상태 표시
17. **Auth Redirect 환경 분리 (2026-02-28)**:
   - `src/app/login/page.tsx`에 `resolveAuthBaseUrl()` 추가
   - 로컬(`localhost/127.0.0.1/0.0.0.0`)에서는 `NEXT_PUBLIC_APP_URL_LOCAL` 우선 사용
   - 그 외 환경에서는 `NEXT_PUBLIC_APP_URL_PRODUCTION` 우선 사용
   - Google OAuth/Email signup의 redirect URL 생성 로직을 동일 규칙으로 통일
   - `.env.example`, `README.md`에 로컬/프로덕션 분리 설정 가이드 추가
18. **영문 UX 통일 + Auth 에러 메시지 개선 (2026-02-28)**:
   - `src/app/login/page.tsx`:
     - 인증 문구/버튼/상태 메시지를 영어로 통일
     - Supabase 에러를 사용자 친화적 영어 문구로 매핑(`mapSupabaseAuthError`)
   - `src/app/page.tsx`, `src/app/profile/page.tsx`, `src/app/create/page.tsx`, `src/app/manage/[id]/page.tsx`:
     - 사용자 노출 한글 문자열을 영어로 교체

### 다음 단계 진행을 위한 Todo 연동

현시점의 전체적인 개발 할 일(Todo)은 항상 루트 디렉토리의 `todo.md` 파일을 참조하고 업데이트합니다.
현재 가장 우선순위가 높은 P0 작업들은 모두 끝났으며, MVP 주요 핵심 기능인 아래 내용을 진행해야 합니다.

- **Auth 마무리**: 이메일 로그인/회원가입, 보호 라우트 미들웨어
- **캐릭터 생성 UI**: 4단계 위저드와 `/api/characters` 연동
- **피드 UX 고도화**: `/api/feed` 기반 탭(For You/Following/My Idols) 상호작용 완성

### 에이전트 인계 지침

- 새로운 세션 시작 시 **우선적으로 이 파일(`memory.md`)과 `todo.md`를 열람**하여 이전 작업 현황을 파악하고 맥락(context)을 이어간다.
- Next.js 실행 포트는 항상 `3000`번이다.
- Agent.md, GEMINI.md, `.cursor/rules` 등 에이전트 및 서비스 정책에 관련된 파일 규칙을 준수한다.
- 서버 API 변경 시 `docs/openapi.yaml`, `todo.md`, `memory.md`를 함께 갱신한다.
19. **Auth 정책 변경: Google-only (2026-02-28)**:
   - `src/app/login/page.tsx`에서 Email login/signup UI 제거
   - 로그인 수단을 Google OAuth로 단일화
   - `src/app/profile/page.tsx` 비로그인 안내 문구를 Google 기준으로 정리
