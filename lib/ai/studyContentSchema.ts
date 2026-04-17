import { z } from "zod";

export const STUDY_CONTENT_KIND = "study_content_v1" as const;
export const STUDY_CONTENT_PROMPT_VERSION = 1 as const;

export const studyFlashcardSchema = z
  .object({
    front: z.string(),
    back: z.string(),
  })
  .strict();

export const studyQuestionSchema = z
  .object({
    question: z.string(),
    answer: z.string(),
    key_points: z.array(z.string()),
  })
  .strict();

export type StudyQuestion = z.infer<typeof studyQuestionSchema>;

export const studyContentSchema = z
  .object({
    summary: z.string(),
    key_points: z.array(z.string()),
    questions: z.array(studyQuestionSchema),
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

/**
 * Deterministic hash of the generation inputs. Used to reuse a prior complete
 * session for the same user + input text + options, which skips the paid
 * Gemini call entirely.
 *
 * Uses the Web Crypto API so the helper is isomorphic; only the server ever
 * calls it today, but keeping it isomorphic avoids forcing a "server-only"
 * boundary on this schema module.
 */
export async function computeContentHash(
  userId: string,
  inputText: string,
  options: GenerateOptions,
): Promise<string> {
  const normalizedOptions = {
    summary: Boolean(options.summary),
    questions: Boolean(options.questions),
    flashcards: Boolean(options.flashcards),
  };
  const payload = JSON.stringify({
    v: 1,
    userId,
    inputText,
    options: normalizedOptions,
  });

  const bytes = new TextEncoder().encode(payload);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const view = new Uint8Array(digest);

  let hex = "";
  for (let i = 0; i < view.length; i++) {
    hex += view[i]!.toString(16).padStart(2, "0");
  }
  return hex;
}

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

/**
 * Normalize questions from MongoDB where old sessions stored `string[]`
 * and new sessions store `StudyQuestion[]`.
 */
export function normalizeQuestions(raw: unknown[]): StudyQuestion[] {
  return raw.map((item) => {
    if (typeof item === "string") {
      return { question: item, answer: "", key_points: [] };
    }
    const parsed = studyQuestionSchema.safeParse(item);
    if (parsed.success) return parsed.data;
    return { question: String(item), answer: "", key_points: [] };
  });
}

/**
 * Normalize a `result` object read from MongoDB, handling backward-compatible
 * question formats (old sessions stored questions as plain strings).
 */
export function normalizeStudyContentFromStorage(raw: unknown): StudyContent {
  const obj = raw as Record<string, unknown>;
  const questions = Array.isArray(obj.questions)
    ? normalizeQuestions(obj.questions)
    : [];

  return {
    summary: typeof obj.summary === "string" ? obj.summary : "",
    key_points: Array.isArray(obj.key_points)
      ? obj.key_points.filter((p): p is string => typeof p === "string")
      : [],
    questions,
    flashcards: Array.isArray(obj.flashcards)
      ? obj.flashcards.filter(
          (f): f is { front: string; back: string } =>
            typeof f === "object" &&
            f !== null &&
            typeof f.front === "string" &&
            typeof f.back === "string",
        )
      : [],
  };
}
