import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api-response";

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * 캐릭터 상세와 최근 포스트를 조회한다.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const supabase = createSupabaseServerClient();

  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", params.id)
    .single();

  if (characterError) {
    return errorResponse("DB_ERROR", characterError.message, 500);
  }

  if (!character) {
    return errorResponse("NOT_FOUND", "Character not found.", 404);
  }

  const { data: recentPosts, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("character_id", params.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  if (postError) {
    return errorResponse("DB_ERROR", postError.message, 500);
  }

  return NextResponse.json({ character, recentPosts });
}

