import { z } from "zod";

/**
 * 포스팅 의도 분류 결과 스키마.
 */
export const contentClassificationSchema = z.object({
  mediaMode: z.enum(["meme_gif_loop", "short_video"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().trim().min(1),
});

export type ContentClassification = z.infer<typeof contentClassificationSchema>;
