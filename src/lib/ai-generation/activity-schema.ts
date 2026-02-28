import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

/**
 * 활동 관리 API 요청 스키마.
 */
export const activityManageRequestSchema = z.object({
  characterId: z.string().uuid(),
  targetDate: z.string().date().optional(),
  applyChanges: z.boolean().default(true),
  syncBatchQueue: z.boolean().default(true),
});

/**
 * 활동 계획 생성 결과 스키마.
 */
export const generatedActivityPlanSchema = z.object({
  dailyTheme: nonEmptyString,
  commentTone: nonEmptyString,
  activityModes: z.array(nonEmptyString).min(1),
  queue: z
    .array(
      z.object({
        sequence: z.number().int().min(1).max(2),
        activityMode: nonEmptyString,
        contentType: z.enum(["image", "video_loop", "mixed"]),
        captionDirection: nonEmptyString,
      }),
    )
    .length(2),
});

export type ActivityManageRequest = z.infer<typeof activityManageRequestSchema>;
export type GeneratedActivityPlan = z.infer<typeof generatedActivityPlanSchema>;
