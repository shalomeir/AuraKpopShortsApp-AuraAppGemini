import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";
import { requireEnv } from "@/lib/env";
import {
  resolveTextModel,
  type TextModelTask,
} from "@/lib/ai-generation/model-policy";

interface VertexJsonRequest {
  prompt: string;
  task?: TextModelTask;
  modelOverride?: string;
}

function parseFallbackModels(): string[] {
  const raw = process.env.MODEL_TEXT_FALLBACK;
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function isModelNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();

  return (
    message.includes("publisher model") &&
    message.includes("not found")
  );
}

/**
 * Vertex Gemini에 프롬프트를 전달하고 JSON 텍스트 결과를 받는다.
 */
export async function generateJsonTextWithVertex(
  request: VertexJsonRequest,
): Promise<{ rawText: string; model: string }> {
  const project = requireEnv("GCP_PROJECT_ID");
  const location = process.env.GCP_LOCATION ?? "us-central1";
  const task = request.task ?? "reasoning";
  const preferredModel = request.modelOverride ?? resolveTextModel(task);
  const fallbackModels = parseFallbackModels();
  const modelCandidates = Array.from(
    new Set([preferredModel, ...fallbackModels, "gemini-2.0-flash-001"]),
  );

  const vertexAi = new VertexAI({ project, location });

  for (const model of modelCandidates) {
    try {
      const generativeModel = vertexAi.getGenerativeModel({ model });
      const response = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      const rawText =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Vertex response has no text candidate");
      }

      return { rawText, model };
    } catch (error) {
      if (isModelNotFoundError(error) && model !== modelCandidates.at(-1)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No available text model could generate content.");
}
