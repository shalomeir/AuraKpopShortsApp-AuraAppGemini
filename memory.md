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
5. **서버/API 1차 구현 (Supabase 기반)**:
   - `src/lib/supabase/{client,server,admin}.ts` 추가
   - `src/app/api/feed/route.ts`
   - `src/app/api/characters/route.ts`, `src/app/api/characters/[id]/route.ts`
   - `src/app/api/ranking/route.ts`
   - `src/app/api/follow/route.ts`
   - `src/app/api/posts/[id]/like/route.ts`
6. **인증 플로우 개선**:
   - `src/app/auth/callback/route.ts` 추가
   - `login/profile` 페이지를 localStorage mock에서 Supabase 세션 기반으로 변경
7. **DB/문서/배포 설정 보강**:
   - `supabase/migrations/20260228162000_init_aura.sql` 추가
   - OpenAPI 문서 `docs/openapi.yaml` 추가
   - `README.md`, `.env.example`, `vercel.json` 업데이트

### 다음 단계 진행을 위한 Todo 연동

현시점의 전체적인 개발 할 일(Todo)은 항상 루트 디렉토리의 `todo.md` 파일을 참조하고 업데이트합니다.
현재 가장 우선순위가 높은 P0 작업들은 모두 끝났으며, MVP 주요 핵심 기능인 아래 내용을 진행해야 합니다.

- **Auth 마무리**: 이메일 로그인/회원가입, 보호 라우트 미들웨어
- **캐릭터 생성 UI**: 4단계 위저드와 `/api/characters` 연동
- **피드 데이터 소스 전환**: mockData -> `/api/feed` 실제 API 연동

### 에이전트 인계 지침

- 새로운 세션 시작 시 **우선적으로 이 파일(`memory.md`)과 `todo.md`를 열람**하여 이전 작업 현황을 파악하고 맥락(context)을 이어간다.
- Next.js 실행 포트는 항상 `8000`번이다.
- Agent.md, GEMINI.md, `.cursor/rules` 등 에이전트 및 서비스 정책에 관련된 파일 규칙을 준수한다.
- 서버 API 변경 시 `docs/openapi.yaml`, `todo.md`, `memory.md`를 함께 갱신한다.
