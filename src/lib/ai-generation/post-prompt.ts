import type { PostContentGenerateRequest } from "@/lib/ai-generation/post-schema";

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

interface RecentPostContext {
  id: string;
  caption: string | null;
  activity_mode: string | null;
  created_at: string;
}

/**
 * 최종 포스팅 콘텐츠 생성용 프롬프트를 만든다.
 */
export function buildPostContentPrompt(input: {
  request: PostContentGenerateRequest;
  character: CharacterContext;
  recentPosts: RecentPostContext[];
}): string {
  return [
    "You are an AI social content producer for a virtual K-POP idol.",
    "Return only valid JSON.",
    "",
    "Output JSON schema:",
    "{",
    '  \"contentType\": \"image|video_loop\",',
    '  \"activityMode\": \"string\",',
    '  \"caption\": \"string\",',
    '  \"overlayText\": \"string\",',
    '  \"hashtags\": [\"string\"],',
    '  \"imagePrompt\": \"string\",',
    '  \"videoPrompt\": \"string\",',
    '  \"safetyNotes\": [\"string\"]',
    "}",
    "",
    "Rules:",
    "- Caption must be under 120 chars.",
    "- Hashtags length: 3 to 7, without # symbol.",
    "- imagePrompt and videoPrompt must be production ready.",
    "- imagePrompt and videoPrompt must preserve the same face identity and persona.",
    "- describe stable face traits explicitly in prompts (hair, face shape, signature expression).",
    "- keep persona behavior style consistent across all generated assets.",
    "- include a clear scene context (place, moment, action, mood) in both prompts.",
    "- maintain continuity with previous storyline and avoid character drift.",
    "- Keep narrative continuity with recent posts and memory.",
    "- Avoid real artist references and sensitive content.",
    "",
    "Character data:",
    JSON.stringify(input.character, null, 2),
    "",
    "Recent posts:",
    JSON.stringify(input.recentPosts, null, 2),
    "",
    "Request data:",
    JSON.stringify(input.request, null, 2),
  ].join("\n");
}
