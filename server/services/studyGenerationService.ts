import "server-only";

import { env } from "@/lib/env";
import { generateStudyContent } from "@/lib/gemini";
import {
  generateOptionsSchema,
  STUDY_CONTENT_KIND,
  STUDY_CONTENT_PROMPT_VERSION,
  type GenerateOptions,
  type StoredStudyResult,
} from "@/lib/ai/studyContentSchema";
import type { GeneratedResult } from "@/models/UserSession";
import {
  ensureUserSessionIndexes,
  findUserSessionByIdempotencyKey,
  insertUserSession,
  updateUserSessionGeneratedResultByIdIfStatus,
} from "@/server/repositories/userSessionRepository";

type PlaceholderGeneratedResult = GeneratedResult & { status: "pending" };

function buildStoredStudyResult(input: {
  content: StoredStudyResult["content"];
  options: GenerateOptions;
}): StoredStudyResult {
  return {
    kind: STUDY_CONTENT_KIND,
    promptVersion: STUDY_CONTENT_PROMPT_VERSION,
    model: env.GEMINI_MODEL(),
    options: {
      summary: input.options.summary,
      questions: input.options.questions,
      flashcards: input.options.flashcards,
    },
    content: input.content,
  };
}

export async function generateStudySession(input: {
  userId: string;
  inputText: string;
  options?: Partial<GenerateOptions>;
  idempotencyKey?: string;
}): Promise<{ id: string; result: StoredStudyResult }> {
  await ensureUserSessionIndexes();

  const options = generateOptionsSchema.parse(input.options ?? {});

  // If the client provides an idempotency key, return the existing session
  // for this user/key instead of triggering another paid model request.
  if (input.idempotencyKey) {
    const existing = await findUserSessionByIdempotencyKey({
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
    });

    if (existing) {
      // If it's still pending, callers can poll later (Phase 1 keeps it simple).
      const generated = existing.generatedResult as unknown;
      if (
        generated &&
        typeof generated === "object" &&
        "kind" in generated &&
        (generated as { kind?: unknown }).kind === STUDY_CONTENT_KIND
      ) {
        return {
          id: existing._id.toString(),
          result: generated as StoredStudyResult,
        };
      }
    }
  }

  const placeholder: PlaceholderGeneratedResult = { status: "pending" };

  const created = await insertUserSession({
    userId: input.userId,
    inputText: input.inputText,
    idempotencyKey: input.idempotencyKey,
    generatedResult: placeholder,
  });

  const id = created._id;

  const content = await generateStudyContent(input.inputText, options);
  const stored = buildStoredStudyResult({ content, options });

  // Only transition pending -> final. If a parallel attempt updated it first,
  // we keep the first writer's result to preserve idempotency semantics.
  await updateUserSessionGeneratedResultByIdIfStatus({
    id,
    fromStatus: "pending",
    generatedResult: stored,
  });

  return { id: id.toString(), result: stored };
}

