import { describe, it, expect } from "vitest";
import {
  buildFirstDayQueueRows,
  buildDailyQueueRows,
  getUtcDayRange,
} from "@/lib/scheduling/posting-policy";

const CHAR_ID = "char-abc-123";

describe("buildFirstDayQueueRows()", () => {
  it("정확히 3개의 큐 항목을 생성한다", () => {
    const rows = buildFirstDayQueueRows(CHAR_ID, new Date());
    expect(rows).toHaveLength(3);
  });

  it("모든 항목의 character_id가 올바르다", () => {
    const rows = buildFirstDayQueueRows(CHAR_ID, new Date());
    rows.forEach((r) => expect(r.character_id).toBe(CHAR_ID));
  });

  it("모든 항목의 status가 pending이다", () => {
    const rows = buildFirstDayQueueRows(CHAR_ID, new Date());
    rows.forEach((r) => expect(r.status).toBe("pending"));
  });

  it("sequence가 1,2,3 순서다", () => {
    const rows = buildFirstDayQueueRows(CHAR_ID, new Date());
    expect(rows.map((r) => r.sequence)).toEqual([1, 2, 3]);
  });

  it("첫 항목은 now와 동일한 시각이다", () => {
    const now = new Date("2026-02-28T09:00:00.000Z");
    const rows = buildFirstDayQueueRows(CHAR_ID, now);
    expect(rows[0].scheduled_at).toBe(now.toISOString());
  });

  it("두 번째 항목은 5분 후다", () => {
    const now = new Date("2026-02-28T09:00:00.000Z");
    const rows = buildFirstDayQueueRows(CHAR_ID, now);
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
    expect(rows[1].scheduled_at).toBe(fiveMinutesLater.toISOString());
  });

  it("세 번째 항목은 60분 후다", () => {
    const now = new Date("2026-02-28T09:00:00.000Z");
    const rows = buildFirstDayQueueRows(CHAR_ID, now);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    expect(rows[2].scheduled_at).toBe(oneHourLater.toISOString());
  });
});

describe("buildDailyQueueRows()", () => {
  it("정확히 2개의 큐 항목을 생성한다", () => {
    const rows = buildDailyQueueRows(CHAR_ID, new Date());
    expect(rows).toHaveLength(2);
  });

  it("모든 항목의 character_id가 올바르다", () => {
    const rows = buildDailyQueueRows(CHAR_ID, new Date());
    rows.forEach((r) => expect(r.character_id).toBe(CHAR_ID));
  });

  it("모든 항목의 status가 pending이다", () => {
    const rows = buildDailyQueueRows(CHAR_ID, new Date());
    rows.forEach((r) => expect(r.status).toBe("pending"));
  });

  it("sequence가 1,2 순서다", () => {
    const rows = buildDailyQueueRows(CHAR_ID, new Date());
    expect(rows.map((r) => r.sequence)).toEqual([1, 2]);
  });

  it("첫 항목은 UTC 09:00이다", () => {
    const date = new Date("2026-02-28T12:00:00.000Z");
    const rows = buildDailyQueueRows(CHAR_ID, date);
    expect(rows[0].scheduled_at).toBe("2026-02-28T09:00:00.000Z");
  });

  it("두 번째 항목은 UTC 21:00이다", () => {
    const date = new Date("2026-02-28T12:00:00.000Z");
    const rows = buildDailyQueueRows(CHAR_ID, date);
    expect(rows[1].scheduled_at).toBe("2026-02-28T21:00:00.000Z");
  });
});

describe("getUtcDayRange()", () => {
  it("start는 해당 날짜 UTC 00:00:00이다", () => {
    const date = new Date("2026-02-28T15:30:00.000Z");
    const { start } = getUtcDayRange(date);
    expect(start.toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });

  it("end는 start 다음날 UTC 00:00:00이다", () => {
    const date = new Date("2026-02-28T15:30:00.000Z");
    const { end } = getUtcDayRange(date);
    expect(end.toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });

  it("start와 end 차이는 정확히 24시간이다", () => {
    const { start, end } = getUtcDayRange(new Date());
    const diffMs = end.getTime() - start.getTime();
    expect(diffMs).toBe(24 * 60 * 60 * 1000);
  });
});
