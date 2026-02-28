import type { ActivityManageRequest } from "@/lib/ai-generation/activity-schema";

interface CharacterContext {
  id: string;
  name: string;
  concept: string | null;
  position: string[] | null;
  signatureMood: string | null;
  persona: string | null;
  commentTone: string | null;
  activityModes: string[] | null;
  memory: unknown;
}

/**
 * 캐릭터 활동 계획 생성을 위한 프롬프트를 구성한다.
 */
export function buildActivityPlanPrompt(input: {
  request: ActivityManageRequest;
  character: CharacterContext;
}): string {
  return [
    "You are an AI idol activity manager.",
    "Return only valid JSON.",
    "",
    "Output JSON schema:",
    "{",
    '  \"dailyTheme\": \"string\",',
    '  \"commentTone\": \"string\",',
    '  \"activityModes\": [\"string\"],',
    '  \"queue\": [',
    "    {",
    '      \"sequence\": 1,',
    '      \"activityMode\": \"string\",',
    '      \"contentType\": \"image|video_loop|mixed\",',
    '      \"captionDirection\": \"string\"',
    "    }",
    "  ]",
    "}",
    "",
    "Rules:",
    "- queue must have exactly 2 items for sequences 1,2.",
    "- Make output practical for short-form K-POP content.",
    "- Keep style consistent with character concept and memory.",
    "- Avoid any real artist references.",
    "",
    "Character data:",
    JSON.stringify(input.character, null, 2),
    "",
    "Request data:",
    JSON.stringify(input.request, null, 2),
  ].join("\n");
}
