import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api-response";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

function parseLimit(value: string | null): number {
  const parsed = Number(value ?? DEFAULT_LIMIT);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

/**
 * 추천/팔로우/내 캐릭터 탭 기준의 피드를 조회한다.
 */
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const tab = request.nextUrl.searchParams.get("tab") ?? "recommended";
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  if (!["recommended", "following", "mine"].includes(tab)) {
    return errorResponse(
      "INVALID_QUERY",
      "tab must be one of recommended, following, mine.",
      400,
    );
  }

  let characterIds: string[] | null = null;

  if (tab === "following" || tab === "mine") {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "Authentication required.", 401);
    }

    if (tab === "following") {
      const { data: follows, error: followsError } = await supabase
        .from("follows")
        .select("character_id")
        .eq("follower_id", user.id);

      if (followsError) {
        return errorResponse("DB_ERROR", followsError.message, 500);
      }

      characterIds = follows.map((row) => row.character_id);
    } else {
      const { data: mine, error: mineError } = await supabase
        .from("characters")
        .select("id")
        .eq("owner_id", user.id);

      if (mineError) {
        return errorResponse("DB_ERROR", mineError.message, 500);
      }

      characterIds = mine.map((row) => row.id);
    }

    if (characterIds.length === 0) {
      return NextResponse.json({ posts: [], nextCursor: null });
    }
  }

  let query = supabase
    .from("posts")
    .select(
      `
      id,
      character_id,
      content_type,
      caption,
      media_url,
      media_thumb_url,
      activity_mode,
      batch_sequence,
      generation_meta,
      like_count,
      view_count,
      share_count,
      status,
      created_at,
      character:characters (
        id,
        name,
        avatar_url,
        follower_count,
        fan_level
      )
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (characterIds) {
    query = query.in("character_id", characterIds);
  }

  const { data: posts, error } = await query;

  if (error) {
    return errorResponse("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ posts, nextCursor: null });
}

