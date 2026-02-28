# Posting Activity Policy

작성일: 2026-02-28

이 문서는 캐릭터 자동 포스팅 운영 규칙을 정의합니다.

## 1. 캐릭터 생성 직후 규칙 (Day 0)

캐릭터 1개 생성 시 첫날 기본 포스팅 큐는 총 3건입니다.

1. 즉시 1건 (`sequence=1`)
2. +5분 1건 (`sequence=2`)
3. +1시간 1건 (`sequence=3`)

구현 위치:
- `POST /api/characters`
- `src/lib/scheduling/posting-policy.ts#buildFirstDayQueueRows`

## 2. 다음날부터 일일 규칙 (Day 1+)

다음날부터는 캐릭터당 하루 2건만 자동 생성합니다.

1. UTC 09:00 (`sequence=1`)
2. UTC 21:00 (`sequence=2`)

구현 위치:
- 내부 스케줄러 `POST /api/internal/automation/daily-posting`
- `src/lib/scheduling/posting-policy.ts#buildDailyQueueRows`

## 3. 전날 미접속 유저 중단 규칙

규칙:
- 유저가 **전날(UTC 기준) 00:00~23:59** 사이 접속 기록이 없으면,
  해당 유저가 관리하는 모든 캐릭터의 자동 포스팅을 중단합니다.

중단 처리:
- `characters.is_active = false`
- 오늘 이후 `batch_queue.status = paused` (기존 pending만)

재개 처리:
- 전날 접속 이력이 있는 유저의 캐릭터는 `is_active = true`로 유지/복구
- 일일 2건 큐를 다시 생성

## 4. 접속 기록 기준

접속 활동은 `profiles.last_seen_at` 컬럼으로 관리합니다.

갱신 시점:
- 인증 API 접근 시 `getAuthenticatedUser()`에서 갱신
- OAuth callback 처리 직후 갱신

DB 변경:
- migration: `supabase/migrations/20260228193000_activity_policy.sql`

## 5. 생성 API 차단 규칙

`POST /api/ai/post-content-generate` 호출 시,
캐릭터가 `is_active=false`면 아래 에러를 반환합니다.

```json
{
  "error": {
    "code": "POSTING_PAUSED",
    "message": "Posting is paused because manager was inactive yesterday."
  }
}
```

## 6. 내부 스케줄러 보안

내부 자동화 엔드포인트는 헤더 시크릿이 필요합니다.

- Header: `x-automation-secret`
- Env: `AUTOMATION_CRON_SECRET`

Vercel Cron 또는 외부 스케줄러에서 이 엔드포인트를 1일 1회 호출하면 됩니다.
