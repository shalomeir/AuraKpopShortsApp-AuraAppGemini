import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface FollowPayload {
  characterId: string;
}

async function recalculateFollowerCount(characterId: string) {
  const admin = createSupabaseAdminClient();
  const { count, error: countError } = await admin
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("character_id", characterId);

  if (countError) {
    throw new Error(countError.message);
  }

  const { error: updateError } = await admin
    .from("characters")
    .update({ follower_count: count ?? 0 })
    .eq("id", characterId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

/**
 * Follows a character.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if ("status" in auth) return auth;

  let payload: FollowPayload;
  try {
    payload = (await request.json()) as FollowPayload;
  } catch {
    return errorResponse("INVALID_BODY", "Invalid JSON body.", 400);
  }

  if (!payload.characterId) {
    return errorResponse("VALIDATION_ERROR", "characterId is required.", 400);
  }

  const admin = createSupabaseAdminClient();

  const { error: insertError } = await admin.from("follows").upsert(
    {
      follower_id: auth.userId,
      character_id: payload.characterId,
    },
    { onConflict: "follower_id,character_id", ignoreDuplicates: true },
  );

  if (insertError) {
    return errorResponse("DB_ERROR", insertError.message, 500);
  }

  try {
    await recalculateFollowerCount(payload.characterId);
  } catch (error) {
    return errorResponse("DB_ERROR", (error as Error).message, 500);
  }

  return NextResponse.json({ success: true });
}

/**
 * Unfollows a character.
 */
export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if ("status" in auth) return auth;

  const characterId = request.nextUrl.searchParams.get("characterId");
  if (!characterId) {
    return errorResponse("VALIDATION_ERROR", "characterId is required.", 400);
  }

  const admin = createSupabaseAdminClient();
  const { error: deleteError } = await admin
    .from("follows")
    .delete()
    .eq("follower_id", auth.userId)
    .eq("character_id", characterId);

  if (deleteError) {
    return errorResponse("DB_ERROR", deleteError.message, 500);
  }

  try {
    await recalculateFollowerCount(characterId);
  } catch (error) {
    return errorResponse("DB_ERROR", (error as Error).message, 500);
  }

  return NextResponse.json({ success: true });
}

