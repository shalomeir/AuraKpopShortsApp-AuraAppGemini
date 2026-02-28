import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveTextModel,
  resolveImageModel,
  resolveVideoModel,
  resolveAudioModels,
} from "@/lib/ai-generation/model-policy";

describe("model-policy", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  describe("resolveTextModel()", () => {
    it("task=simple 이면 기본 flash 모델을 반환한다", () => {
      delete process.env.MODEL_SIMPLE_TEXT;
      expect(resolveTextModel("simple")).toBe("gemini-3-flash");
    });

    it("task=reasoning 이면 기본 pro 모델을 반환한다", () => {
      delete process.env.MODEL_REASONING;
      expect(resolveTextModel("reasoning")).toBe("gemini-3.1-pro");
    });

    it("환경변수 MODEL_SIMPLE_TEXT가 설정되면 그 값을 반환한다", () => {
      process.env.MODEL_SIMPLE_TEXT = "my-flash-model";
      expect(resolveTextModel("simple")).toBe("my-flash-model");
    });

    it("환경변수 MODEL_REASONING이 설정되면 그 값을 반환한다", () => {
      process.env.MODEL_REASONING = "my-pro-model";
      expect(resolveTextModel("reasoning")).toBe("my-pro-model");
    });
  });

  describe("resolveImageModel()", () => {
    it("환경변수 없으면 기본 이미지 모델을 반환한다", () => {
      delete process.env.MODEL_IMAGE;
      expect(resolveImageModel()).toBe("nano-banana-2");
    });

    it("환경변수 MODEL_IMAGE가 설정되면 그 값을 반환한다", () => {
      process.env.MODEL_IMAGE = "imagen-3";
      expect(resolveImageModel()).toBe("imagen-3");
    });
  });

  describe("resolveVideoModel()", () => {
    it("환경변수 없으면 기본 비디오 모델을 반환한다", () => {
      delete process.env.MODEL_VIDEO;
      expect(resolveVideoModel()).toBe("veo-3-fast");
    });

    it("환경변수 MODEL_VIDEO가 설정되면 그 값을 반환한다", () => {
      process.env.MODEL_VIDEO = "veo-3-ultra";
      expect(resolveVideoModel()).toBe("veo-3-ultra");
    });
  });

  describe("resolveAudioModels()", () => {
    it("환경변수 없으면 기본 오디오 모델 객체를 반환한다", () => {
      delete process.env.MODEL_AUDIO_PRIMARY;
      delete process.env.MODEL_AUDIO_FALLBACK;
      expect(resolveAudioModels()).toEqual({
        primary: "lyria-3",
        fallback: "lyria-2",
      });
    });

    it("환경변수가 설정되면 해당 값을 반환한다", () => {
      process.env.MODEL_AUDIO_PRIMARY = "lyria-4";
      process.env.MODEL_AUDIO_FALLBACK = "lyria-3";
      expect(resolveAudioModels()).toEqual({
        primary: "lyria-4",
        fallback: "lyria-3",
      });
    });
  });
});
