import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { characterGenerationRequestSchema } from "@/lib/character-gen/schema";
import { generateCharacterWithVertex } from "@/lib/character-gen/vertex";
import { persistCharacterGeneration } from "@/lib/character-gen/storage";

export const runtime = "nodejs";

/**
 * PRD Step 1~4 기반으로 캐릭터를 생성하고 Supabase Storage에 저장한다.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_BODY", "Invalid JSON body.", 400);
  }

  const parsed = characterGenerationRequestSchema.safeParse(body);
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
  const requestId = payload.requestId ?? crypto.randomUUID();

  let managerUserId = payload.managerUserId;

  if (!managerUserId) {
    const auth = await getAuthenticatedUser();
    if ("status" in auth) {
      return auth;
    }
    managerUserId = auth.userId;
  }

  try {
    const generated = await generateCharacterWithVertex(payload);
    const persisted = await persistCharacterGeneration({
      requestId,
      managerUserId,
      request: payload,
      character: generated.character,
      rawText: generated.rawText,
      model: generated.model,
    });

    return NextResponse.json(
      {
        requestId,
        storageBucket: persisted.storageBucket,
        storagePath: persisted.storagePath,
        character: generated.character,
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
