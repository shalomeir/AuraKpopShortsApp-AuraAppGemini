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

/**
 * Vertex Gemini에 프롬프트를 전달하고 JSON 텍스트 결과를 받는다.
 */
export async function generateJsonTextWithVertex(
  request: VertexJsonRequest,
): Promise<{ rawText: string; model: string }> {
  const project = requireEnv("GCP_PROJECT_ID");
  const location = process.env.GCP_LOCATION ?? "us-central1";
  const task = request.task ?? "reasoning";
  const model = request.modelOverride ?? resolveTextModel(task);

  const vertexAi = new VertexAI({ project, location });
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

  const rawText = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Vertex response has no text candidate");
  }

  return { rawText, model };
}
