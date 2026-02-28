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

### 다음 단계 진행을 위한 Todo 연동

현시점의 전체적인 개발 할 일(Todo)은 항상 루트 디렉토리의 `todo.md` 파일을 참조하고 업데이트합니다.
현재 가장 우선순위가 높은 P0 작업들은 모두 끝났으며, MVP 주요 핵심 기능인 아래 내용을 진행해야 합니다.

- **Supabase DB 구축**: 테이블 디자인 및 RLS 셋업 (Migrations)
- **Auth (계정 연동)**: Google OAuth 설정 및 보호된 라우트
- **기본 UI 컴포넌트 개발**: 피드(Feed) 카드, 위저드 형태의 생성 페이지

### 에이전트 인계 지침

- 새로운 세션 시작 시 **우선적으로 이 파일(`memory.md`)과 `todo.md`를 열람**하여 이전 작업 현황을 파악하고 맥락(context)을 이어간다.
- Next.js 실행 포트는 항상 `8000`번이다.
- Agent.md, GEMINI.md, `.cursor/rules` 등 에이전트 및 서비스 정책에 관련된 파일 규칙을 준수한다.
