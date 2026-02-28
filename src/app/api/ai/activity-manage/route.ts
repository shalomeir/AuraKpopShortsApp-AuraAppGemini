import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  activityManageRequestSchema,
  generatedActivityPlanSchema,
} from "@/lib/ai-generation/activity-schema";
import { buildActivityPlanPrompt } from "@/lib/ai-generation/activity-prompt";
import { generateJsonTextWithVertex } from "@/lib/ai-generation/vertex-json";
import { parseJsonObject } from "@/lib/ai-generation/json-utils";
import { buildDailyQueueRows } from "@/lib/scheduling/posting-policy";

export const runtime = "nodejs";

/**
 * 캐릭터 활동 계획을 생성하고 필요 시 캐릭터/배치 상태에 반영한다.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if ("status" in auth) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_BODY", "Invalid JSON body.", 400);
  }

  const parsed = activityManageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body is invalid.",
        },
        details: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const admin = createSupabaseAdminClient();

  const { data: character, error: characterError } = await admin
    .from("characters")
    .select(
      "id,name,concept,position,signature_mood,persona,comment_tone,activity_modes,memory",
    )
    .eq("id", payload.characterId)
    .eq("owner_id", auth.userId)
    .single();

  if (characterError || !character) {
    return errorResponse("NOT_FOUND", "Character not found.", 404);
  }

  try {
    const prompt = buildActivityPlanPrompt({
      request: payload,
      character: {
        id: character.id,
        name: character.name,
        concept: character.concept,
        position: character.position,
        signatureMood: character.signature_mood,
        persona: character.persona,
        commentTone: character.comment_tone,
        activityModes: character.activity_modes,
        memory: character.memory,
      },
    });

    const generated = await generateJsonTextWithVertex({
      prompt,
      task: "reasoning",
    });
    const parsedJson = parseJsonObject(generated.rawText);
    const planParsed = generatedActivityPlanSchema.safeParse(parsedJson);

    if (!planParsed.success) {
      return errorResponse("GENERATION_FAILED", "Invalid activity plan output.", 500);
    }

    const plan = planParsed.data;

    if (payload.applyChanges) {
      const now = payload.targetDate
        ? new Date(`${payload.targetDate}T09:00:00.000Z`)
        : new Date();

      const { error: updateError } = await admin
        .from("characters")
        .update({
          activity_modes: plan.activityModes,
          comment_tone: plan.commentTone,
          memory: {
            ...(character.memory as Record<string, unknown>),
            last_activity_plan: {
              generated_at: new Date().toISOString(),
              daily_theme: plan.dailyTheme,
              queue: plan.queue,
            },
          },
        })
        .eq("id", character.id)
        .eq("owner_id", auth.userId);

      if (updateError) {
        return errorResponse("DB_ERROR", updateError.message, 500);
      }

      if (payload.syncBatchQueue) {
        const queueRows = buildDailyQueueRows(character.id, now);

        const { error: queueError } = await admin.from("batch_queue").insert(queueRows);
        if (queueError) {
          return errorResponse("DB_ERROR", queueError.message, 500);
        }
      }
    }

    return NextResponse.json({
      characterId: character.id,
      applied: payload.applyChanges,
      plan,
      model: generated.model,
    });
  } catch (error) {
    return errorResponse(
      "GENERATION_FAILED",
      error instanceof Error ? error.message : "Unknown generation error",
      500,
    );
  }
}
