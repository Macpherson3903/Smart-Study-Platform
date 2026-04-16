import "server-only";

import { GeminiError, MODELS, generateStudyContent } from "@/lib/gemini";
import {
  generateOptionsSchema,
  STUDY_CONTENT_KIND,
  STUDY_CONTENT_PROMPT_VERSION,
  type GenerateOptions,
  type StoredStudyResult,
} from "@/lib/ai/studyContentSchema";
import type { StudySessionAiMeta, StudySessionError } from "@/models/StudySession";
import {
  ensureStudySessionIndexes,
  findStudySessionByIdempotencyKey,
  insertPendingStudySession,
  updateStudySessionToCompleteByIdIfStatus,
  updateStudySessionToErrorByIdIfStatus,
} from "@/server/repositories/studySessionRepository";

const INPUT_TEXT_PREVIEW_CHARS = 400;

function buildAiMeta(options: GenerateOptions): StudySessionAiMeta {
  return {
    kind: STUDY_CONTENT_KIND,
    promptVersion: STUDY_CONTENT_PROMPT_VERSION,
    model: MODELS[0],
    options,
  };
}

function buildStoredStudyResult(input: {
  content: StoredStudyResult["content"];
  aiMeta: StudySessionAiMeta;
}): StoredStudyResult {
  return {
    kind: input.aiMeta.kind,
    promptVersion: input.aiMeta.promptVersion,
    model: input.aiMeta.model,
    options: input.aiMeta.options,
    content: input.content,
  };
}

export type GenerateStudySessionResult =
  | { status: "complete"; id: string; result: StoredStudyResult }
  | { status: "pending"; id: string }
  | { status: "error"; id: string; error: StudySessionError };

export async function generateStudySession(input: {
  userId: string;
  inputText: string;
  options?: Partial<GenerateOptions>;
  idempotencyKey?: string;
}): Promise<GenerateStudySessionResult> {
  await ensureStudySessionIndexes();

  const options = generateOptionsSchema.parse(input.options ?? {});
  const aiMeta = buildAiMeta(options);
  const inputTextPreview = input.inputText.slice(0, INPUT_TEXT_PREVIEW_CHARS);

  // If the client provides an idempotency key, return the existing session
  // for this user/key instead of triggering another paid model request.
  if (input.idempotencyKey) {
    const existing = await findStudySessionByIdempotencyKey({
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
    });

    if (existing) {
      if (existing.inputText !== input.inputText) {
        return {
          status: "error",
          id: existing._id.toString(),
          error: {
            code: "IDEMPOTENCY_CONFLICT",
            message:
              "Idempotency key already used with different input. Use a new idempotency key.",
          },
        };
      }

      if (existing.status === "complete" && "result" in existing) {
        const stored = buildStoredStudyResult({
          content: existing.result,
          aiMeta: existing.aiMeta,
        });

        return { status: "complete", id: existing._id.toString(), result: stored };
      }

      if (existing.status === "pending") {
        return { status: "pending", id: existing._id.toString() };
      }

      if (existing.status === "error" && "error" in existing) {
        return { status: "error", id: existing._id.toString(), error: existing.error };
      }
    }
  }

  const created = await insertPendingStudySession({
    userId: input.userId,
    inputText: input.inputText,
    inputTextPreview,
    idempotencyKey: input.idempotencyKey,
    aiMeta,
  });

  const id = created._id;

  try {
    const { content, modelUsed } = await generateStudyContent(input.inputText, options, {
      sessionId: id.toString(),
    });
    const stored = buildStoredStudyResult({
      content,
      aiMeta: { ...aiMeta, model: modelUsed },
    });

    // Only transition pending -> final. If a parallel attempt updated it first,
    // we keep the first writer's result to preserve idempotency semantics.
    await updateStudySessionToCompleteByIdIfStatus({
      userId: input.userId,
      id,
      fromStatus: "pending",
      result: content,
    });

    return { status: "complete", id: id.toString(), result: stored };
  } catch (err) {
    if (err instanceof GeminiError && err.code === "GEMINI_UNAVAILABLE") {
      console.log(
        `[AI] Session ${id.toString()}: all models exhausted (GEMINI_UNAVAILABLE); leaving pending for retry`,
      );
      return { status: "pending", id: id.toString() };
    }

    const error: StudySessionError =
      err instanceof GeminiError
        ? { code: err.code, message: err.message }
        : err instanceof Error
          ? { code: "INTERNAL_ERROR", message: err.message }
          : { code: "UNKNOWN_ERROR", message: "Unexpected error" };

    await updateStudySessionToErrorByIdIfStatus({
      userId: input.userId,
      id,
      fromStatus: "pending",
      error,
    });

    throw err;
  }
}

