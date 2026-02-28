# TODO

## P0 (Week 1) — 작동하는 뼈대

- [x] Mockup Data 생성 (초기 개발용)
- [x] Next.js 프로젝트 초기화 (shadcn/ui 세팅)
- [x] Supabase 프로젝트 셋업 + DB 마이그레이션
- [x] Supabase 프로필 자동 생성/보정 로직 추가 (FK 제약으로 인한 데이터 생성 실패 방지)
- [x] 통합 환경 연동 완료 (Vercel 배포 준비, Supabase 원격 연결, GCP Vertex & Gemini 2.x Flash 설정 및 ADC 인증)
- [x] Auth (Google OAuth only)
- [ ] 캐릭터 생성 API + UI (4단계 위저드)
- [ ] 배치 큐 등록 로직
- [x] 서버 API 1차 구현 (feed, characters, ranking, follow, like)

## P1 (Week 1~2) — 핵심 기능

- [ ] LLM 카피 생성 연동 (Vercel AI SDK)
- [ ] GCP Imagen 이미지 생성 연동
- [ ] 배치 Edge Function + pg_cron 설정
- [ ] 메인 피드 UI (3탭 + 폴링)
  - [x] 3탭(`/api/feed`: recommended/following/mine) 연동 및 인증 에러(401) 처리
- [x] 주요 화면 mock 데이터 제거 및 Supabase 조회 전환 (홈/캐릭터/랭킹/관리)
- [x] `src/lib/mockData.ts` 제거 (Supabase + API 기반으로 단일화)
- [x] 개발용 Supabase seed SQL 추가 (빈 DB에서도 피드/랭킹 확인 가능)
- [ ] 팔로우 / 좋아요 API

## P2 (Week 2) — 마무리

- [ ] GCP Veo GIF 생성 연동
- [ ] 인기 랭킹 페이지
- [ ] 캐릭터 관리 화면 (메모리 타임라인)
- [ ] 외부 공유 (Web Share API + 워터마크)
- [ ] 디자인 polish (Neon Shaman Pop 테마)

## P3 (Week 3~4) — 검증 후 개선

- [ ] 성과 지표 대시보드 (내부용)
- [ ] 에러 핸들링 강화 + 재시도 로직
- [ ] 콘텐츠 퀄리티 프롬프트 튜닝
