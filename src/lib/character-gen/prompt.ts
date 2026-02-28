import type { CharacterGenerationRequest } from "@/lib/character-gen/schema";

/**
 * 캐릭터 생성 품질을 일정하게 유지하기 위한 고정 프롬프트를 생성한다.
 */
export function buildCharacterGenerationPrompt(
  request: CharacterGenerationRequest,
): string {
  const outputLanguage = request.language === "ko" ? "Korean" : "English";

  return [
    "You are an AI character producer for a K-POP virtual idol platform.",
    "Return only valid JSON. No markdown. No explanations.",
    "",
    "Output JSON schema:",
    "{",
    '  \"name\": \"string\",',
    '  \"shortBio\": \"string\",',
    '  \"debutCopy\": \"string\",',
    '  \"visualPrompt\": \"string\",',
    '  \"memeVideoPrompt\": \"string\",',
    '  \"tags\": [\"string\", \"string\", \"string\"]',
    "}",
    "",
    "Constraints:",
    `- Write all fields in ${outputLanguage}.`,
    "- Keep shortBio under 120 chars.",
    "- debutCopy must be social-ready and under 90 chars.",
    "- visualPrompt must be safe, original, and photo generation ready.",
    "- memeVideoPrompt must target short vertical video meme scenes.",
    "- visualPrompt and memeVideoPrompt must include stable face/persona traits for consistency.",
    "- tags should be 3 to 7 unique hashtags without # symbol.",
    "- Never reference real K-POP artists or copyrighted names.",
    "",
    "Character input:",
    JSON.stringify(request, null, 2),
    "",
    "If characterNameHint exists, prefer it unless it is unsafe.",
  ].join("\n");
}
