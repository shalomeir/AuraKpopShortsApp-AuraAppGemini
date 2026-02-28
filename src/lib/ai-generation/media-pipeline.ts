import {
  resolveAudioModels,
  resolveImageModel,
  resolveTextModel,
  resolveVideoModel,
} from "@/lib/ai-generation/model-policy";

export type MediaMode = "meme_gif_loop" | "short_video";

interface BuildMediaPipelinePlanInput {
  character: {
    id: string;
    name: string;
    concept: string | null;
    persona: string | null;
    avatarUrl: string | null;
  };
  imagePrompt: string;
  videoPrompt: string;
  requestedMode: MediaMode;
}

/**
 * 캐릭터 페르소나/얼굴 유지 조건을 포함한 미디어 생성 파이프라인 계획을 만든다.
 */
export function buildMediaPipelinePlan(input: BuildMediaPipelinePlanInput) {
  const imageModel = resolveImageModel();
  const videoModel = resolveVideoModel();
  const audioModels = resolveAudioModels();
  const reasoningModel = resolveTextModel("reasoning");

  const personaLock = {
    characterId: input.character.id,
    characterName: input.character.name,
    concept: input.character.concept,
    persona: input.character.persona,
    faceReferenceImageUrl: input.character.avatarUrl,
    mustKeepFaceConsistency: true,
    mustKeepPersonaConsistency: true,
  };

  if (input.requestedMode === "meme_gif_loop") {
    return {
      mediaMode: "meme_gif_loop",
      personaLock,
      steps: [
        {
          order: 1,
          provider: "google",
          model: imageModel,
          task: "text-to-gif-loop",
          payload: {
            format: "gif",
            durationSeconds: 2,
            prompt: input.videoPrompt,
            personaLock,
          },
        },
      ],
      estimatedPrimaryModels: {
        textReasoning: reasoningModel,
        image: imageModel,
      },
    };
  }

  return {
    mediaMode: "short_video",
    personaLock,
    steps: [
      {
        order: 1,
        provider: "google",
        model: imageModel,
        task: "text-to-image",
        payload: {
          format: "png",
          prompt: input.imagePrompt,
          personaLock,
        },
      },
      {
        order: 2,
        provider: "google",
        model: videoModel,
        task: "image-to-video",
        payload: {
          durationSeconds: 6,
          prompt: input.videoPrompt,
          sourceFromPreviousStep: 1,
          personaLock,
        },
      },
      {
        order: 3,
        provider: "google",
        model: audioModels.primary,
        fallbackModel: audioModels.fallback,
        task: "music-voice-overlay-optional",
        payload: {
          mood: input.character.concept,
          style: input.character.persona,
        },
      },
    ],
    estimatedPrimaryModels: {
      textReasoning: reasoningModel,
      image: imageModel,
      video: videoModel,
      audio: audioModels.primary,
      audioFallback: audioModels.fallback,
    },
  };
}
