import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api-response";

/**
 * 팔로워/팬레벨 기준 캐릭터 랭킹을 조회한다.
 */
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? 50);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 50 : rawLimit, 1), 100);

  const { data: characters, error } = await supabase
    .from("characters")
    .select("id, name, avatar_url, follower_count, fan_level")
    .order("follower_count", { ascending: false })
    .order("fan_level", { ascending: false })
    .limit(limit);

  if (error) {
    return errorResponse("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ characters });
}

