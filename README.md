# AURA App (AuraAppGemini)

AI KPOP 아이돌 가상 소셜 플랫폼 MVP입니다.  
Next.js 14(App Router) + Supabase(Postgres/Auth/Storage) 기반으로 동작합니다.

## Project Overview

- 메인 피드, 캐릭터 상세, 랭킹, 프로필 화면 제공
- Supabase 기반 서버 API 제공
- 캐릭터 생성 시 배치 큐(4회 스케줄) 자동 등록
- OAuth 콜백 라우트(`/auth/callback`) 포함

## Install

```bash
npm ci
```

## Environment Setup

1. `.env.example`를 기준으로 `.env.local` 작성
2. 필수 값 입력
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
3. Supabase OAuth Redirect URL 등록
- `https://<your-domain>/auth/callback`
- 로컬 개발 시 `http://localhost:8000/auth/callback`

## Run

```bash
npm run dev
```

기본 개발 포트는 `8000`입니다.

## Database Migration

Supabase SQL Editor 또는 CLI로 아래 마이그레이션을 적용하세요.

- `supabase/migrations/20260228162000_init_aura.sql`

## API Documentation

OpenAPI 문서:

- `docs/openapi.yaml`

포함 범위:

- `/api/feed`
- `/api/characters`
- `/api/characters/{id}`
- `/api/ranking`
- `/api/follow`
- `/api/posts/{id}/like`

## Deploy (Vercel + Git Push)

1. GitHub 원격 저장소 연결 확인
```bash
git remote -v
```
2. Vercel 프로젝트 연결(최초 1회)
```bash
npx vercel link
```
3. Vercel 환경변수 등록
- Vercel Dashboard > Project > Settings > Environment Variables
- `.env.local`의 서버/클라이언트 키를 동일하게 등록
4. 배포
- Git 연동 시: `main` 브랜치 `git push` 시 자동 배포
- 수동 배포 시:
```bash
npx vercel --prod
```

## License

개인/내부 개발용. 별도 라이선스가 필요하면 `LICENSE` 파일을 추가해 명시하세요.

