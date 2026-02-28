import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildDailyQueueRows,
  getUtcDayRange,
} from "@/lib/scheduling/posting-policy";

export const runtime = "nodejs";

/**
 * 전날 접속 여부 기반으로 캐릭터 활성/중단을 판단하고 일일 2건 큐를 생성한다.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.AUTOMATION_CRON_SECRET;
  const token = request.headers.get("x-automation-secret");

  if (!secret || token !== secret) {
    return errorResponse("UNAUTHORIZED", "Invalid automation secret.", 401);
  }

  const admin = createSupabaseAdminClient();
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayRange = getUtcDayRange(yesterday);
  const todayRange = getUtcDayRange(now);

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id,last_seen_at");

  if (profileError || !profiles) {
    return errorResponse("DB_ERROR", profileError?.message ?? "Failed to read profiles.", 500);
  }

  const activeOwnerIds: string[] = [];
  const pausedOwnerIds: string[] = [];

  for (const profile of profiles) {
    const lastSeenAt = profile.last_seen_at ? new Date(profile.last_seen_at) : null;

    const isActiveYesterday =
      !!lastSeenAt &&
      lastSeenAt >= yesterdayRange.start &&
      lastSeenAt < yesterdayRange.end;

    if (isActiveYesterday) {
      activeOwnerIds.push(profile.id);
    } else {
      pausedOwnerIds.push(profile.id);
    }
  }

  if (pausedOwnerIds.length > 0) {
    const { error: pauseCharacterError } = await admin
      .from("characters")
      .update({ is_active: false })
      .in("owner_id", pausedOwnerIds);

    if (pauseCharacterError) {
      return errorResponse("DB_ERROR", pauseCharacterError.message, 500);
    }

    const { data: pausedCharacterRows } = await admin
      .from("characters")
      .select("id")
      .in("owner_id", pausedOwnerIds);

    const pausedCharacterIds = (pausedCharacterRows ?? []).map((row) => row.id);
    if (pausedCharacterIds.length > 0) {
      const { error: pauseQueueError } = await admin
        .from("batch_queue")
        .update({ status: "paused" })
        .in("character_id", pausedCharacterIds)
        .eq("status", "pending")
        .gte("scheduled_at", todayRange.start.toISOString());

      if (pauseQueueError) {
        return errorResponse("DB_ERROR", pauseQueueError.message, 500);
      }
    }
  }

  if (activeOwnerIds.length === 0) {
    return NextResponse.json({
      queued: 0,
      activeOwners: 0,
      pausedOwners: pausedOwnerIds.length,
    });
  }

  const { error: reactivateError } = await admin
    .from("characters")
    .update({ is_active: true })
    .in("owner_id", activeOwnerIds);

  if (reactivateError) {
    return errorResponse("DB_ERROR", reactivateError.message, 500);
  }

  const { data: activeCharacters, error: characterError } = await admin
    .from("characters")
    .select("id")
    .in("owner_id", activeOwnerIds)
    .eq("is_active", true);

  if (characterError || !activeCharacters) {
    return errorResponse("DB_ERROR", characterError?.message ?? "Failed to read characters.", 500);
  }

  let queuedCount = 0;

  for (const character of activeCharacters) {
    const { data: existingRows, error: existingError } = await admin
      .from("batch_queue")
      .select("sequence")
      .eq("character_id", character.id)
      .gte("scheduled_at", todayRange.start.toISOString())
      .lt("scheduled_at", todayRange.end.toISOString())
      .in("status", ["pending", "processing", "completed"]);

    if (existingError) {
      return errorResponse("DB_ERROR", existingError.message, 500);
    }

    const existingSequenceSet = new Set((existingRows ?? []).map((row) => row.sequence));
    const dailyRows = buildDailyQueueRows(character.id, now);
    const rowsToInsert = dailyRows.filter((row) => !existingSequenceSet.has(row.sequence));

    if (rowsToInsert.length > 0) {
      const { error: queueError } = await admin.from("batch_queue").insert(rowsToInsert);
      if (queueError) {
        return errorResponse("DB_ERROR", queueError.message, 500);
      }
      queuedCount += rowsToInsert.length;
    }
  }

  return NextResponse.json({
    queued: queuedCount,
    activeOwners: activeOwnerIds.length,
    pausedOwners: pausedOwnerIds.length,
  });
}
