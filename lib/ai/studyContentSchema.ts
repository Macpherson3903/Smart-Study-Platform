import { z } from "zod";

export const STUDY_CONTENT_KIND = "study_content_v1" as const;
export const STUDY_CONTENT_PROMPT_VERSION = 1 as const;

export const studyFlashcardSchema = z
  .object({
    front: z.string(),
    back: z.string(),
  })
  .strict();

export const studyContentSchema = z
  .object({
    summary: z.string(),
    key_points: z.array(z.string()),
    questions: z.array(z.string()),
    flashcards: z.array(studyFlashcardSchema),
  })
  .strict();

export type StudyContent = z.infer<typeof studyContentSchema>;

export const storedStudyResultSchema = z
  .object({
    kind: z.literal(STUDY_CONTENT_KIND),
    promptVersion: z.literal(STUDY_CONTENT_PROMPT_VERSION),
    model: z.string(),
    options: z
      .object({
        summary: z.boolean(),
        questions: z.boolean(),
        flashcards: z.boolean(),
      })
      .strict(),
    content: studyContentSchema,
  })
  .strict();

export type StoredStudyResult = z.infer<typeof storedStudyResultSchema>;

export const generateOptionsSchema = z
  .object({
    summary: z.boolean().default(true),
    questions: z.boolean().default(true),
    flashcards: z.boolean().default(true),
  })
  .strict();

export type GenerateOptions = z.infer<typeof generateOptionsSchema>;

export function normalizeStudyContentForOptions(
  content: StudyContent,
  options: GenerateOptions,
): StudyContent {
  return {
    summary: options.summary ? content.summary : "",
    key_points: options.summary ? content.key_points : [],
    questions: options.questions ? content.questions : [],
    flashcards: options.flashcards ? content.flashcards : [],
  };
}

