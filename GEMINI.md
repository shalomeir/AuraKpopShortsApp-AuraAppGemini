# GEMINI.md

## Project Intelligence & Rules

- **Next.js Port Rule**: 항상 개발 서버(dev server) 환경 시작 시 포트는 3000번을 사용한다.
  - `package.json` 내 `"dev": "next dev"` 로 고정.
- **Supabase/GCP 연동 키**: `.env.local` 에 저장하고 관리.
