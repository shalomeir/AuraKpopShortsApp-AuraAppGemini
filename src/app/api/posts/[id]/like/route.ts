import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: {
    id: string;
  };
}

async function recalculateLikeCount(postId: string) {
  const admin = createSupabaseAdminClient();
  const { count, error: countError } = await admin
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (countError) {
    throw new Error(countError.message);
  }

  const { error: updateError } = await admin
    .from("posts")
    .update({ like_count: count ?? 0 })
    .eq("id", postId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

/**
 * 포스트 좋아요를 생성한다.
 */
export async function POST(
  _request: Request,
  { params }: RouteContext,
) {
  const auth = await getAuthenticatedUser();
  if ("status" in auth) return auth;

  const admin = createSupabaseAdminClient();
  const { error: insertError } = await admin.from("post_likes").upsert(
    {
      post_id: params.id,
      user_id: auth.userId,
    },
    { onConflict: "post_id,user_id", ignoreDuplicates: true },
  );

  if (insertError) {
    return errorResponse("DB_ERROR", insertError.message, 500);
  }

  try {
    await recalculateLikeCount(params.id);
  } catch (error) {
    return errorResponse("DB_ERROR", (error as Error).message, 500);
  }

  return NextResponse.json({ success: true });
}

/**
 * 포스트 좋아요를 취소한다.
 */
export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  const auth = await getAuthenticatedUser();
  if ("status" in auth) return auth;

  const admin = createSupabaseAdminClient();
  const { error: deleteError } = await admin
    .from("post_likes")
    .delete()
    .eq("post_id", params.id)
    .eq("user_id", auth.userId);

  if (deleteError) {
    return errorResponse("DB_ERROR", deleteError.message, 500);
  }

  try {
    await recalculateLikeCount(params.id);
  } catch (error) {
    return errorResponse("DB_ERROR", (error as Error).message, 500);
  }

  return NextResponse.json({ success: true });
}

