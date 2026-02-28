export interface QueueRow {
  character_id: string;
  scheduled_at: string;
  sequence: number;
  status: "pending";
}

const FIRST_DAY_OFFSETS_MINUTES = [0, 5, 60] as const;
const DAILY_HOURS_UTC = [9, 21] as const;

/**
 * 캐릭터 생성 직후 첫날 게시 큐(즉시 2개 + 1시간 뒤 1개)를 만든다.
 */
export function buildFirstDayQueueRows(
  characterId: string,
  now: Date,
): QueueRow[] {
  return FIRST_DAY_OFFSETS_MINUTES.map((offset, index) => ({
    character_id: characterId,
    scheduled_at: new Date(now.getTime() + offset * 60 * 1000).toISOString(),
    sequence: index + 1,
    status: "pending",
  }));
}

/**
 * 일일 게시 큐(매일 2개)를 만든다.
 */
export function buildDailyQueueRows(characterId: string, date: Date): QueueRow[] {
  const baseUtcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  return DAILY_HOURS_UTC.map((hour, index) => ({
    character_id: characterId,
    scheduled_at: new Date(baseUtcDate.getTime() + hour * 60 * 60 * 1000).toISOString(),
    sequence: index + 1,
    status: "pending",
  }));
}

/**
 * 특정 날짜 범위의 시작/종료 UTC 시각을 만든다.
 */
export function getUtcDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
