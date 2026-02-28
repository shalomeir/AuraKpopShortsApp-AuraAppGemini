import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

/**
 * 최종 포스팅 콘텐츠 생성 API 요청 스키마.
 */
export const postContentGenerateRequestSchema = z.object({
  characterId: z.string().uuid(),
  sequence: z.number().int().min(1).max(4).optional(),
  activityMode: nonEmptyString.optional(),
  mediaMode: z.enum(["auto", "meme_gif_loop", "short_video"]).default("auto"),
  persistDraft: z.boolean().default(true),
});

/**
 * 최종 포스팅 생성 결과 스키마.
 */
export const generatedPostContentSchema = z.object({
  contentType: z.enum(["image", "video_loop"]),
  activityMode: nonEmptyString,
  caption: nonEmptyString,
  overlayText: nonEmptyString,
  hashtags: z.array(nonEmptyString).min(3),
  imagePrompt: nonEmptyString,
  videoPrompt: nonEmptyString,
  safetyNotes: z.array(nonEmptyString).min(1),
});

export type PostContentGenerateRequest = z.infer<
  typeof postContentGenerateRequestSchema
>;

export type GeneratedPostContent = z.infer<typeof generatedPostContentSchema>;
