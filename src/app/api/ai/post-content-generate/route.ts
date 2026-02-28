import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  generatedPostContentSchema,
  postContentGenerateRequestSchema,
} from "@/lib/ai-generation/post-schema";
import { contentClassificationSchema } from "@/lib/ai-generation/content-classification-schema";
import { buildPostContentPrompt } from "@/lib/ai-generation/post-prompt";
import { generateJsonTextWithVertex } from "@/lib/ai-generation/vertex-json";
import { parseJsonObject } from "@/lib/ai-generation/json-utils";
import { buildMediaPipelinePlan, type MediaMode } from "@/lib/ai-generation/media-pipeline";

export const runtime = "nodejs";

/**
 * 최종 포스팅용 캡션/해시태그/이미지·영상 프롬프트를 생성한다.
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

  const parsed = postContentGenerateRequestSchema.safeParse(body);
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
      "id,name,concept,position,signature_mood,persona,comment_tone,activity_modes,memory,avatar_url,is_active",
    )
    .eq("id", payload.characterId)
    .eq("owner_id", auth.userId)
    .single();

  if (characterError || !character) {
    return errorResponse("NOT_FOUND", "Character not found.", 404);
  }

  if (!character.is_active) {
    return errorResponse(
      "POSTING_PAUSED",
      "Posting is paused because manager was inactive yesterday.",
      403,
    );
  }

  const { data: recentPosts, error: recentError } = await admin
    .from("posts")
    .select("id,caption,activity_mode,created_at")
    .eq("character_id", payload.characterId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentError) {
    return errorResponse("DB_ERROR", recentError.message, 500);
  }

  try {
    let resolvedMediaMode: MediaMode;
    let classification: unknown = null;

    if (payload.mediaMode === "auto") {
      const classificationPrompt = [
        "Classify requested output mode for AI idol post production.",
        "Return only JSON.",
        '{"mediaMode":"meme_gif_loop|short_video","confidence":0.0,"reason":"string"}',
        "",
        "Rule:",
        "- meme_gif_loop: short meme reaction, 2~4 sec loop style",
        "- short_video: longer narrative clip",
        "",
        "Input:",
        JSON.stringify(
          {
            sequence: payload.sequence,
            activityMode: payload.activityMode,
            character: {
              concept: character.concept,
              persona: character.persona,
              signatureMood: character.signature_mood,
            },
          },
          null,
          2,
        ),
      ].join("\n");

      const classified = await generateJsonTextWithVertex({
        prompt: classificationPrompt,
        task: "simple",
      });
      const classificationParsed = contentClassificationSchema.safeParse(
        parseJsonObject(classified.rawText),
      );

      if (!classificationParsed.success) {
        return errorResponse(
          "GENERATION_FAILED",
          "Invalid content classification output.",
          500,
        );
      }

      classification = {
        ...classificationParsed.data,
        model: classified.model,
      };
      resolvedMediaMode = classificationParsed.data.mediaMode;
    } else {
      resolvedMediaMode = payload.mediaMode;
    }

    const prompt = buildPostContentPrompt({
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
      recentPosts: recentPosts ?? [],
    });

    const generated = await generateJsonTextWithVertex({
      prompt,
      task: "reasoning",
    });
    const parsedJson = parseJsonObject(generated.rawText);
    const contentParsed = generatedPostContentSchema.safeParse(parsedJson);

    if (!contentParsed.success) {
      return errorResponse("GENERATION_FAILED", "Invalid post content output.", 500);
    }

    const content = contentParsed.data;
    const mediaPipeline = buildMediaPipelinePlan({
      character: {
        id: character.id,
        name: character.name,
        concept: character.concept,
        persona: character.persona,
        avatarUrl: character.avatar_url,
      },
      imagePrompt: content.imagePrompt,
      videoPrompt: content.videoPrompt,
      requestedMode: resolvedMediaMode,
    });

    const baseMemory =
      character.memory &&
      typeof character.memory === "object" &&
      !Array.isArray(character.memory)
        ? (character.memory as Record<string, unknown>)
        : {};

    const existingTimeline = Array.isArray(baseMemory.persona_timeline)
      ? (baseMemory.persona_timeline as unknown[])
      : [];

    const personaEvent = {
      recorded_at: new Date().toISOString(),
      activity_mode: content.activityMode,
      media_mode: resolvedMediaMode,
      caption: content.caption,
      overlay_text: content.overlayText,
      scene_hint: content.videoPrompt.slice(0, 220),
      persona_rule: "mustKeepFaceConsistency + mustKeepPersonaConsistency",
    };

    const nextTimeline = [...existingTimeline, personaEvent].slice(-50);
    const nextMemory: Record<string, unknown> = {
      ...baseMemory,
      persona_timeline: nextTimeline,
      last_scene: personaEvent,
      last_persona_tone: content.activityMode,
      post_generation_count:
        typeof baseMemory.post_generation_count === "number"
          ? baseMemory.post_generation_count + 1
          : 1,
    };

    const { error: memoryUpdateError } = await admin
      .from("characters")
      .update({ memory: nextMemory })
      .eq("id", character.id)
      .eq("owner_id", auth.userId);

    if (memoryUpdateError) {
      return errorResponse("DB_ERROR", memoryUpdateError.message, 500);
    }

    let draftPostId: string | null = null;
    if (payload.persistDraft) {
      const captionWithTags = `${content.caption} ${content.hashtags
        .map((tag) => `#${tag}`)
        .join(" ")}`.trim();

      const { data: draftPost, error: draftError } = await admin
        .from("posts")
        .insert({
          character_id: character.id,
          content_type: content.contentType,
          caption: captionWithTags,
          activity_mode: content.activityMode,
          batch_sequence: payload.sequence ?? null,
          status: "draft",
          generation_meta: {
            text_generation_model: generated.model,
            classification,
            media_mode: resolvedMediaMode,
            media_pipeline: mediaPipeline,
            overlay_text: content.overlayText,
            image_prompt: content.imagePrompt,
            video_prompt: content.videoPrompt,
            safety_notes: content.safetyNotes,
          },
        })
        .select("id")
        .single();

      if (draftError) {
        return errorResponse("DB_ERROR", draftError.message, 500);
      }

      draftPostId = draftPost?.id ?? null;
    }

    return NextResponse.json(
      {
        characterId: character.id,
        draftPostId,
        content,
        model: {
          classification:
            classification && typeof classification === "object"
              ? (classification as { model?: string }).model ?? null
              : null,
          reasoning: generated.model,
        },
        mediaMode: resolvedMediaMode,
        mediaPipeline,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(
      "GENERATION_FAILED",
      error instanceof Error ? error.message : "Unknown generation error",
      500,
    );
  }
}
