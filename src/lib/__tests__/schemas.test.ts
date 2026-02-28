import { describe, it, expect } from "vitest";
import {
  activityManageRequestSchema,
  generatedActivityPlanSchema,
} from "@/lib/ai-generation/activity-schema";
import {
  postContentGenerateRequestSchema,
  generatedPostContentSchema,
} from "@/lib/ai-generation/post-schema";
import {
  characterGenerationRequestSchema,
  generatedCharacterSchema,
} from "@/lib/character-gen/schema";
import { contentClassificationSchema } from "@/lib/ai-generation/content-classification-schema";

// ─── activityManageRequestSchema ─────────────────────────────────────────────

describe("activityManageRequestSchema", () => {
  const VALID = {
    characterId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("유효한 최소 입력을 통과한다", () => {
    const result = activityManageRequestSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it("characterId가 UUID가 아니면 실패한다", () => {
    const result = activityManageRequestSchema.safeParse({
      ...VALID,
      characterId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("applyChanges 기본값은 true다", () => {
    const result = activityManageRequestSchema.safeParse(VALID);
    expect(result.success && result.data.applyChanges).toBe(true);
  });

  it("syncBatchQueue 기본값은 true다", () => {
    const result = activityManageRequestSchema.safeParse(VALID);
    expect(result.success && result.data.syncBatchQueue).toBe(true);
  });

  it("targetDate에 올바른 날짜 형식이면 통과한다", () => {
    const result = activityManageRequestSchema.safeParse({
      ...VALID,
      targetDate: "2026-02-28",
    });
    expect(result.success).toBe(true);
  });

  it("targetDate에 잘못된 형식이면 실패한다", () => {
    const result = activityManageRequestSchema.safeParse({
      ...VALID,
      targetDate: "28-02-2026",
    });
    expect(result.success).toBe(false);
  });
});

// ─── generatedActivityPlanSchema ─────────────────────────────────────────────

describe("generatedActivityPlanSchema", () => {
  const VALID_PLAN = {
    dailyTheme: "Performance Day",
    commentTone: "friendly",
    activityModes: ["performance", "daily"],
    queue: [
      {
        sequence: 1,
        activityMode: "performance",
        contentType: "image",
        captionDirection: "Show off dance moves",
      },
      {
        sequence: 2,
        activityMode: "daily",
        contentType: "video_loop",
        captionDirection: "Chill morning routine",
      },
    ],
  };

  it("유효한 활동 계획을 통과한다", () => {
    const result = generatedActivityPlanSchema.safeParse(VALID_PLAN);
    expect(result.success).toBe(true);
  });

  it("queue 항목이 2개가 아니면 실패한다", () => {
    const result = generatedActivityPlanSchema.safeParse({
      ...VALID_PLAN,
      queue: [VALID_PLAN.queue[0]],
    });
    expect(result.success).toBe(false);
  });

  it("activityModes가 빈 배열이면 실패한다", () => {
    const result = generatedActivityPlanSchema.safeParse({
      ...VALID_PLAN,
      activityModes: [],
    });
    expect(result.success).toBe(false);
  });

  it("contentType이 허용되지 않은 값이면 실패한다", () => {
    const invalidQueue = [
      { ...VALID_PLAN.queue[0], contentType: "reels" },
      VALID_PLAN.queue[1],
    ];
    const result = generatedActivityPlanSchema.safeParse({
      ...VALID_PLAN,
      queue: invalidQueue,
    });
    expect(result.success).toBe(false);
  });

  it("dailyTheme가 빈 문자열이면 실패한다", () => {
    const result = generatedActivityPlanSchema.safeParse({
      ...VALID_PLAN,
      dailyTheme: "   ",
    });
    expect(result.success).toBe(false);
  });
});

// ─── postContentGenerateRequestSchema ────────────────────────────────────────

describe("postContentGenerateRequestSchema", () => {
  const VALID = {
    characterId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("유효한 최소 입력을 통과한다", () => {
    const result = postContentGenerateRequestSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it("mediaMode 기본값은 auto다", () => {
    const result = postContentGenerateRequestSchema.safeParse(VALID);
    expect(result.success && result.data.mediaMode).toBe("auto");
  });

  it("persistDraft 기본값은 true다", () => {
    const result = postContentGenerateRequestSchema.safeParse(VALID);
    expect(result.success && result.data.persistDraft).toBe(true);
  });

  it("sequence가 1~4 범위 안이면 통과한다", () => {
    [1, 2, 3, 4].forEach((seq) => {
      const result = postContentGenerateRequestSchema.safeParse({
        ...VALID,
        sequence: seq,
      });
      expect(result.success).toBe(true);
    });
  });

  it("sequence가 0이면 실패한다", () => {
    const result = postContentGenerateRequestSchema.safeParse({
      ...VALID,
      sequence: 0,
    });
    expect(result.success).toBe(false);
  });

  it("sequence가 5이면 실패한다", () => {
    const result = postContentGenerateRequestSchema.safeParse({
      ...VALID,
      sequence: 5,
    });
    expect(result.success).toBe(false);
  });

  it("mediaMode가 허용되지 않은 값이면 실패한다", () => {
    const result = postContentGenerateRequestSchema.safeParse({
      ...VALID,
      mediaMode: "tiktok",
    });
    expect(result.success).toBe(false);
  });
});

// ─── generatedPostContentSchema ──────────────────────────────────────────────

describe("generatedPostContentSchema", () => {
  const VALID_CONTENT = {
    contentType: "image",
    activityMode: "performance",
    caption: "Hitting the stage! 🎤",
    overlayText: "LIVE NOW",
    hashtags: ["#kpop", "#aura", "#idol"],
    imagePrompt: "A vibrant idol on stage under colorful lights",
    videoPrompt: "Dynamic dance moves with neon background",
    safetyNotes: ["No adult content", "PG-13 only"],
  };

  it("유효한 포스트 콘텐츠를 통과한다", () => {
    const result = generatedPostContentSchema.safeParse(VALID_CONTENT);
    expect(result.success).toBe(true);
  });

  it("hashtags가 3개 미만이면 실패한다", () => {
    const result = generatedPostContentSchema.safeParse({
      ...VALID_CONTENT,
      hashtags: ["#kpop", "#aura"],
    });
    expect(result.success).toBe(false);
  });

  it("safetyNotes가 빈 배열이면 실패한다", () => {
    const result = generatedPostContentSchema.safeParse({
      ...VALID_CONTENT,
      safetyNotes: [],
    });
    expect(result.success).toBe(false);
  });

  it("contentType이 허용되지 않은 값이면 실패한다", () => {
    const result = generatedPostContentSchema.safeParse({
      ...VALID_CONTENT,
      contentType: "gif",
    });
    expect(result.success).toBe(false);
  });
});

// ─── characterGenerationRequestSchema ────────────────────────────────────────

describe("characterGenerationRequestSchema", () => {
  const VALID_REQUEST = {
    profile: {
      gender: "female",
      ageRange: "twenties",
      nationality: "Korean",
      faceShape: "oval",
      hairColor: "black",
      fashionMood: "streetwear",
      concept: "cute",
    },
    idol: {
      positions: ["main_vocal", "visual"],
      signatureMood: "bright",
      persona: "casual",
    },
    activityModes: ["performance", "daily"],
    commentTone: "friendly",
  };

  it("유효한 요청을 통과한다", () => {
    const result = characterGenerationRequestSchema.safeParse(VALID_REQUEST);
    expect(result.success).toBe(true);
  });

  it("language 기본값은 ko다", () => {
    const result = characterGenerationRequestSchema.safeParse(VALID_REQUEST);
    expect(result.success && result.data.language).toBe("ko");
  });

  it("positions가 빈 배열이면 실패한다", () => {
    const result = characterGenerationRequestSchema.safeParse({
      ...VALID_REQUEST,
      idol: { ...VALID_REQUEST.idol, positions: [] },
    });
    expect(result.success).toBe(false);
  });

  it("activityModes가 빈 배열이면 실패한다", () => {
    const result = characterGenerationRequestSchema.safeParse({
      ...VALID_REQUEST,
      activityModes: [],
    });
    expect(result.success).toBe(false);
  });

  it("language가 지원되지 않는 값이면 실패한다", () => {
    const result = characterGenerationRequestSchema.safeParse({
      ...VALID_REQUEST,
      language: "jp",
    });
    expect(result.success).toBe(false);
  });

  it("profile의 필수 필드 누락 시 실패한다", () => {
    const { faceShape: _, ...profileWithoutFaceShape } = VALID_REQUEST.profile;
    const result = characterGenerationRequestSchema.safeParse({
      ...VALID_REQUEST,
      profile: profileWithoutFaceShape,
    });
    expect(result.success).toBe(false);
  });
});

// ─── generatedCharacterSchema ─────────────────────────────────────────────────

describe("generatedCharacterSchema", () => {
  const VALID_CHAR = {
    name: "Sora",
    shortBio: "밝고 에너지 넘치는 멀티 포지션 아이돌",
    debutCopy: "하늘에서 내려온 별, SORA의 데뷔!",
    visualPrompt: "A cute Korean female idol with big brown eyes",
    memeVideoPrompt: "Funny idol doing aegyo with sparkle effects",
    tags: ["#cute", "#kpop", "#idol"],
  };

  it("유효한 캐릭터 결과를 통과한다", () => {
    const result = generatedCharacterSchema.safeParse(VALID_CHAR);
    expect(result.success).toBe(true);
  });

  it("tags가 3개 미만이면 실패한다", () => {
    const result = generatedCharacterSchema.safeParse({
      ...VALID_CHAR,
      tags: ["#cute", "#kpop"],
    });
    expect(result.success).toBe(false);
  });

  it("name이 빈 문자열이면 실패한다", () => {
    const result = generatedCharacterSchema.safeParse({
      ...VALID_CHAR,
      name: "  ",
    });
    expect(result.success).toBe(false);
  });
});

// ─── contentClassificationSchema ─────────────────────────────────────────────

describe("contentClassificationSchema", () => {
  it("유효한 분류 결과를 통과한다", () => {
    const result = contentClassificationSchema.safeParse({
      mediaMode: "short_video",
      confidence: 0.92,
      reason: "Narrative content fits short video format",
    });
    expect(result.success).toBe(true);
  });

  it("confidence가 0~1 범위를 벗어나면 실패한다", () => {
    expect(
      contentClassificationSchema.safeParse({
        mediaMode: "short_video",
        confidence: 1.5,
        reason: "too confident",
      }).success,
    ).toBe(false);

    expect(
      contentClassificationSchema.safeParse({
        mediaMode: "short_video",
        confidence: -0.1,
        reason: "negative",
      }).success,
    ).toBe(false);
  });

  it("mediaMode가 허용되지 않은 값이면 실패한다", () => {
    const result = contentClassificationSchema.safeParse({
      mediaMode: "reels",
      confidence: 0.8,
      reason: "test",
    });
    expect(result.success).toBe(false);
  });

  it("reason이 빈 문자열이면 실패한다", () => {
    const result = contentClassificationSchema.safeParse({
      mediaMode: "meme_gif_loop",
      confidence: 0.8,
      reason: "   ",
    });
    expect(result.success).toBe(false);
  });
});
