import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildFirstDayQueueRows } from "@/lib/scheduling/posting-policy";

interface CharacterCreatePayload {
  name: string;
  gender?: string;
  ageRange?: string;
  nationality?: string;
  faceShape?: string;
  hairColor?: string;
  fashionMood?: string;
  concept?: string;
  position?: string[];
  signatureMood?: string;
  persona?: string;
  commentTone?: string;
  activityModes?: string[];
  avatarUrl?: string;
}

/**
 * Creates a character and registers initial batch queue (first day 3 items).
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if ("status" in auth) return auth;

  let payload: CharacterCreatePayload;
  try {
    payload = (await request.json()) as CharacterCreatePayload;
  } catch {
    return errorResponse("INVALID_BODY", "Invalid JSON body.", 400);
  }

  const normalizedName = payload.name?.trim();
  if (!normalizedName) {
    return errorResponse("VALIDATION_ERROR", "name is required.", 400);
  }

  const admin = createSupabaseAdminClient();
  const now = new Date();

  const { data: createdCharacter, error: insertError } = await admin
    .from("characters")
    .insert({
      owner_id: auth.userId,
      name: normalizedName,
      gender: payload.gender ?? "female",
      age_range: payload.ageRange ?? "twenties",
      nationality: payload.nationality ?? "Korea",
      face_shape: payload.faceShape ?? "v-line",
      hair_color: payload.hairColor ?? "black",
      fashion_mood: payload.fashionMood ?? "trendy",
      concept: payload.concept ?? "cute",
      position: payload.position ?? ["main_vocal"],
      signature_mood: payload.signatureMood ?? "bright",
      persona: payload.persona ?? "casual",
      comment_tone: payload.commentTone ?? "friendly",
      activity_modes: payload.activityModes ?? ["performance", "daily"],
      avatar_url: payload.avatarUrl ?? null,
    })
    .select("*")
    .single();

  if (insertError || !createdCharacter) {
    return errorResponse(
      "DB_ERROR",
      insertError?.message ?? "Failed to create character.",
      500,
    );
  }

  const queueRows = buildFirstDayQueueRows(createdCharacter.id, now);

  const { error: queueError } = await admin.from("batch_queue").insert(queueRows);
  if (queueError) {
    return errorResponse("DB_ERROR", queueError.message, 500);
  }

  return NextResponse.json({ character: createdCharacter }, { status: 201 });
}
