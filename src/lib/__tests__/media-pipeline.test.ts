import { describe, it, expect, afterEach } from "vitest";
import { buildMediaPipelinePlan } from "@/lib/ai-generation/media-pipeline";

const BASE_CHARACTER = {
  id: "char-001",
  name: "Sora",
  concept: "cute",
  persona: "casual",
  avatarUrl: "https://example.com/avatar.png",
};

const BASE_INPUT = {
  character: BASE_CHARACTER,
  imagePrompt: "A bright idol on stage",
  videoPrompt: "Dancing with neon lights",
};

describe("buildMediaPipelinePlan()", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe("meme_gif_loop 모드", () => {
    it("mediaMode가 meme_gif_loop인 결과를 반환한다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "meme_gif_loop",
      });
      expect(plan.mediaMode).toBe("meme_gif_loop");
    });

    it("steps가 1개다 (gif-loop 생성 단계만)", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "meme_gif_loop",
      });
      expect(plan.steps).toHaveLength(1);
    });

    it("step의 task가 text-to-gif-loop다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "meme_gif_loop",
      });
      expect(plan.steps[0].task).toBe("text-to-gif-loop");
    });

    it("personaLock에 캐릭터 정보가 담긴다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "meme_gif_loop",
      });
      expect(plan.personaLock.characterId).toBe("char-001");
      expect(plan.personaLock.characterName).toBe("Sora");
      expect(plan.personaLock.mustKeepFaceConsistency).toBe(true);
      expect(plan.personaLock.mustKeepPersonaConsistency).toBe(true);
    });

    it("estimatedPrimaryModels에 image 키가 있다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "meme_gif_loop",
      });
      expect(plan.estimatedPrimaryModels).toHaveProperty("image");
    });
  });

  describe("short_video 모드", () => {
    it("mediaMode가 short_video인 결과를 반환한다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "short_video",
      });
      expect(plan.mediaMode).toBe("short_video");
    });

    it("steps가 3개다 (image → video → audio)", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "short_video",
      });
      expect(plan.steps).toHaveLength(3);
    });

    it("step 순서가 text-to-image → image-to-video → music-voice-overlay-optional이다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "short_video",
      });
      expect(plan.steps[0].task).toBe("text-to-image");
      expect(plan.steps[1].task).toBe("image-to-video");
      expect(plan.steps[2].task).toBe("music-voice-overlay-optional");
    });

    it("step order가 1,2,3이다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "short_video",
      });
      expect(plan.steps.map((s) => s.order)).toEqual([1, 2, 3]);
    });

    it("estimatedPrimaryModels에 video, audio 키가 있다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "short_video",
      });
      expect(plan.estimatedPrimaryModels).toHaveProperty("video");
      expect(plan.estimatedPrimaryModels).toHaveProperty("audio");
      expect(plan.estimatedPrimaryModels).toHaveProperty("audioFallback");
    });

    it("환경변수로 모델을 오버라이드할 수 있다", () => {
      process.env.MODEL_IMAGE = "imagen-3";
      process.env.MODEL_VIDEO = "veo-ultra";
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        requestedMode: "short_video",
      });
      expect(plan.steps[0].model).toBe("imagen-3");
      expect(plan.steps[1].model).toBe("veo-ultra");
    });
  });

  describe("avatarUrl이 null인 경우", () => {
    it("faceReferenceImageUrl이 null이어도 오류가 발생하지 않는다", () => {
      const plan = buildMediaPipelinePlan({
        ...BASE_INPUT,
        character: { ...BASE_CHARACTER, avatarUrl: null },
        requestedMode: "short_video",
      });
      expect(plan.personaLock.faceReferenceImageUrl).toBeNull();
    });
  });
});
