import { generateJsonTextWithVertex } from "@/lib/ai-generation/vertex-json";
import { parseGeneratedCharacter } from "@/lib/character-gen/json";
import { buildCharacterGenerationPrompt } from "@/lib/character-gen/prompt";
import type {
  CharacterGenerationRequest,
  GeneratedCharacter,
} from "@/lib/character-gen/schema";

/**
 * Vertex AI Gemini를 호출해 캐릭터 생성 결과를 만든다.
 */
export async function generateCharacterWithVertex(
  request: CharacterGenerationRequest,
): Promise<{ character: GeneratedCharacter; rawText: string; model: string }> {
  const prompt = buildCharacterGenerationPrompt(request);
  const generated = await generateJsonTextWithVertex({
    prompt,
    task: "reasoning",
  });
  const rawText = generated.rawText;

  const character = parseGeneratedCharacter(rawText);
  return { character, rawText, model: generated.model };
}
