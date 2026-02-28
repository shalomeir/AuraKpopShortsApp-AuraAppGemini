import {
  generatedCharacterSchema,
  type GeneratedCharacter,
} from "@/lib/character-gen/schema";

/**
 * 모델 응답에서 JSON 객체를 추출하고 스키마를 검증한다.
 */
export function parseGeneratedCharacter(rawText: string): GeneratedCharacter {
  const trimmed = rawText.trim();
  const direct = safeJsonParse(trimmed);
  const candidate = direct ?? safeJsonParse(extractJsonObject(trimmed));

  if (!candidate) {
    throw new Error("Model response is not valid JSON");
  }

  const validated = generatedCharacterSchema.safeParse(candidate);
  if (!validated.success) {
    throw new Error(
      `Model response does not match schema: ${validated.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
    );
  }

  return validated.data;
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractJsonObject(value: string): string {
  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");
  if (first === -1 || last === -1 || first >= last) {
    return value;
  }
  return value.slice(first, last + 1);
}
