export type TextModelTask = "simple" | "reasoning";

const defaultSimpleTextModel = "gemini-2.0-flash-001";
const defaultReasoningModel = "gemini-2.0-flash-001";
const defaultImageModel = "nano-banana-2";
const defaultVideoModel = "veo-3-fast";
const defaultAudioPrimaryModel = "lyria-3";
const defaultAudioFallbackModel = "lyria-2";

/**
 * 작업 성격에 따라 텍스트 모델을 선택한다.
 */
export function resolveTextModel(task: TextModelTask): string {
  if (task === "simple") {
    return process.env.MODEL_SIMPLE_TEXT ?? defaultSimpleTextModel;
  }

  return process.env.MODEL_REASONING ?? defaultReasoningModel;
}

/**
 * 이미지 생성 모델 정책.
 */
export function resolveImageModel(): string {
  return process.env.MODEL_IMAGE ?? defaultImageModel;
}

/**
 * 영상 생성 모델 정책.
 */
export function resolveVideoModel(): string {
  return process.env.MODEL_VIDEO ?? defaultVideoModel;
}

/**
 * 음악/음성 생성 모델 정책.
 */
export function resolveAudioModels(): { primary: string; fallback: string } {
  return {
    primary: process.env.MODEL_AUDIO_PRIMARY ?? defaultAudioPrimaryModel,
    fallback: process.env.MODEL_AUDIO_FALLBACK ?? defaultAudioFallbackModel,
  };
}
