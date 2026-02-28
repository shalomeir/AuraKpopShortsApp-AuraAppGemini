# AURA App

AURA는 AI K-POP 아이돌 가상 소셜 플랫폼 MVP입니다. Next.js + Supabase(PostgreSQL/Auth) 기반으로 피드, 캐릭터, 팔로우/좋아요 API를 제공합니다.

## 프로젝트 개요

- 프론트엔드: Next.js 14 (App Router), TypeScript, Tailwind CSS
- 백엔드: Next.js Route Handlers
- 데이터베이스/인증: Supabase PostgreSQL + Supabase Auth

## 설치 방법

```bash
npm install
```

## 환경 설정

1. `.env.example`를 복사해 `.env.local` 생성
2. Supabase 대시보드에서 아래 값 채우기

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase DB 생성 및 마이그레이션

### 방법 A: Supabase Dashboard SQL Editor

1. Supabase 프로젝트 생성
2. `supabase/migrations/20260228162000_init_aura.sql` 실행
3. `supabase/migrations/20260228183000_profile_bootstrap.sql` 실행

### 방법 B: Supabase CLI

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## 개발용 시드 데이터 생성

데이터가 비어있을 때 피드/랭킹/관리 화면 확인을 위해 개발용 시드 SQL을 제공합니다.

1. 먼저 Supabase Auth 사용자(최소 1명)를 생성합니다.
2. Supabase SQL Editor에서 `supabase/seeds/dev-seed.sql` 내용을 실행합니다.

특징:
- `seed_tag=aura_dev_seed_v1` 로 생성되므로 재실행 시 기존 시드 데이터를 정리하고 다시 생성합니다.
- `profiles`, `characters`, `posts`, `batch_queue`를 함께 채웁니다.
- 최대 3명의 `auth.users`를 기반으로 더미 캐릭터를 생성합니다.

## 실행 방법

개발 서버는 항상 3000 포트를 사용합니다.

```bash
npm run dev -- --port 3000
```

## 인증 (Supabase Auth)

- Google OAuth login only (email signup/signin disabled)
- 이메일 인증 링크 콜백 처리 지원 (`/auth/callback`)
- 보호 라우트: `/create`, `/manage` (비로그인 시 `/login?next=...`로 이동)
- 리다이렉트 URL 환경 분리:
  - `NEXT_PUBLIC_APP_URL_LOCAL=http://localhost:3000`
  - `NEXT_PUBLIC_APP_URL_PRODUCTION=https://<your-production-domain>`

### Supabase URL Configuration 필수 항목

Supabase Dashboard > Authentication > URL Configuration

- Site URL: `https://<your-production-domain>` (운영 도메인)
- Redirect URLs 허용 목록에 반드시 추가:
  - `http://localhost:3000/auth/callback`
  - `https://<your-production-domain>/auth/callback`

주의:
- 이메일 인증 메일은 발송 시점의 URL 설정을 사용하므로, 설정 변경 후에는 인증 메일을 새로 발송해야 합니다.

## 데이터 생성 확인 방법

1. Supabase Auth로 로그인 사용자 생성
2. 아래 API 호출로 캐릭터 생성

```bash
curl -X POST "http://localhost:3000/api/characters" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aura Mina",
    "gender": "female",
    "concept": "chic"
  }'
```

정상 시 `201`과 함께 `character` 객체가 반환되고, `batch_queue` 4건이 함께 생성됩니다.

## 라이선스

현재 저장소에 `LICENSE` 파일이 없습니다. 배포 전 라이선스 파일을 추가하세요.
