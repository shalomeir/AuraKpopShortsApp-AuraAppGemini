import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

/**
 * PRD Step 1~4 기반 캐릭터 생성 요청 스키마.
 */
export const characterGenerationRequestSchema = z.object({
  managerUserId: nonEmptyString.uuid().optional(),
  requestId: nonEmptyString.optional(),
  profile: z.object({
    gender: nonEmptyString,
    ageRange: nonEmptyString,
    nationality: nonEmptyString,
    faceShape: nonEmptyString,
    hairColor: nonEmptyString,
    fashionMood: nonEmptyString,
    concept: nonEmptyString,
  }),
  idol: z.object({
    positions: z.array(nonEmptyString).min(1),
    signatureMood: nonEmptyString,
    persona: nonEmptyString,
  }),
  activityModes: z.array(nonEmptyString).min(1),
  commentTone: nonEmptyString,
  language: z.enum(["ko", "en"]).default("ko"),
  characterNameHint: nonEmptyString.optional(),
});

/**
 * LLM 생성 결과 스키마.
 */
export const generatedCharacterSchema = z.object({
  name: nonEmptyString,
  shortBio: nonEmptyString,
  debutCopy: nonEmptyString,
  visualPrompt: nonEmptyString,
  memeVideoPrompt: nonEmptyString,
  tags: z.array(nonEmptyString).min(3),
});

export type CharacterGenerationRequest = z.infer<
  typeof characterGenerationRequestSchema
>;

export type GeneratedCharacter = z.infer<typeof generatedCharacterSchema>;
