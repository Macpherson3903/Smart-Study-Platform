import "server-only";

import { ApiError, GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { env } from "@/lib/env";
import {
  generateOptionsSchema,
  normalizeStudyContentForOptions,
  studyContentSchema,
  type GenerateOptions,
  type StudyContent,
} from "@/lib/ai/studyContentSchema";
import {
  buildStudyContentSystemPrompt,
  buildStudyContentUserPrompt,
} from "@/lib/ai/prompts/studyContentPrompts";

export type GeminiErrorCode =
  | "GEMINI_RATE_LIMITED"
  | "GEMINI_UNAVAILABLE"
  | "GEMINI_TIMEOUT"
  | "GEMINI_SAFETY_BLOCKED"
  | "GEMINI_INVALID_RESPONSE"
  | "GEMINI_UNKNOWN";

export class GeminiError extends Error {
  readonly code: GeminiErrorCode;
  readonly status?: number;
  readonly retryAfterSeconds?: number;
  readonly cause?: unknown;

  constructor(input: {
    message: string;
    code: GeminiErrorCode;
    status?: number;
    retryAfterSeconds?: number;
    cause?: unknown;
  }) {
    super(input.message);
    this.name = "GeminiError";
    this.code = input.code;
    this.status = input.status;
    this.retryAfterSeconds = input.retryAfterSeconds;
    this.cause = input.cause;
  }
}

function getClient(): GoogleGenAI {
  // The SDK is lightweight, but we keep a tiny singleton to avoid re-init churn.
  const apiKey = env.GEMINI_API_KEY();
  return new GoogleGenAI({ apiKey });
}

function getModelName(): string {
  return env.GEMINI_MODEL();
}

/**
 * Attempt to recover a JSON object from model text without a second model call.
 */
function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Remove accidental Markdown fences.
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const first = withoutFences.indexOf("{");
  const last = withoutFences.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;

  return withoutFences.slice(first, last + 1);
}

function parseAndValidateStudyContent(
  rawText: string,
  options: GenerateOptions,
): StudyContent {
  const jsonCandidate = extractJsonObject(rawText);
  if (!jsonCandidate) {
    throw new GeminiError({
      message: "Model returned empty or non-JSON output.",
      code: "GEMINI_INVALID_RESPONSE",
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonCandidate);
  } catch (cause) {
    throw new GeminiError({
      message: "Model returned invalid JSON.",
      code: "GEMINI_INVALID_RESPONSE",
      cause,
    });
  }

  const validated = studyContentSchema.safeParse(parsed);
  if (!validated.success) {
    throw new GeminiError({
      message: "Model returned JSON that does not match the required schema.",
      code: "GEMINI_INVALID_RESPONSE",
      cause: validated.error,
    });
  }

  return normalizeStudyContentForOptions(validated.data, options);
}

function mapGeminiError(err: unknown): GeminiError {
  // `@google/genai` errors are not strongly typed; we map by best-effort.
  const message =
    err instanceof Error ? err.message : "Gemini request failed unexpectedly.";

  const status =
    err instanceof ApiError
      ? err.status
      : typeof (err as { status?: unknown } | undefined)?.status === "number"
        ? ((err as { status: number }).status as number)
        : undefined;
  const headers =
    typeof (err as { headers?: unknown } | undefined)?.headers === "object"
      ? ((err as { headers: unknown }).headers as unknown)
      : undefined;

  if (status === 429) {
    // Retry-After header is not guaranteed, but we attempt to extract it.
    const retryAfterSeconds = (() => {
      if (!headers) return undefined;

      // SDK may provide DOM Headers, Node Headers, or a plain object.
      const rawValue =
        typeof (headers as { get?: unknown }).get === "function"
          ? (headers as { get: (name: string) => string | null }).get(
              "retry-after",
            )
          : (headers as Record<string, unknown>)["retry-after"];

      const first = Array.isArray(rawValue) ? rawValue[0] : rawValue;
      const num =
        typeof first === "string" || typeof first === "number"
          ? Number(first)
          : NaN;
      return Number.isFinite(num) ? num : undefined;
    })();

    return new GeminiError({
      message,
      code: "GEMINI_RATE_LIMITED",
      status,
      retryAfterSeconds,
      cause: err,
    });
  }

  if (status && status >= 500) {
    return new GeminiError({
      message,
      code: "GEMINI_UNAVAILABLE",
      status,
      cause: err,
    });
  }

  if (status === 400 || status === 403) {
    // Could be safety blocked or invalid request; callers can surface generic message.
    return new GeminiError({
      message,
      code: "GEMINI_SAFETY_BLOCKED",
      status,
      cause: err,
    });
  }

  // Heuristic timeout detection.
  if (
    typeof message === "string" &&
    /timeout|timed out|aborted|abort/i.test(message)
  ) {
    return new GeminiError({
      message,
      code: "GEMINI_TIMEOUT",
      status,
      cause: err,
    });
  }

  return new GeminiError({
    message,
    code: "GEMINI_UNKNOWN",
    status,
    cause: err,
  });
}

function responseText(response: GenerateContentResponse): string {
  return response.text ?? "";
}

export async function generateStudyContent(
  inputText: string,
  optionsInput?: Partial<GenerateOptions>,
): Promise<StudyContent> {
  const options = generateOptionsSchema.parse(optionsInput ?? {});

  const systemInstruction = buildStudyContentSystemPrompt();
  const userPrompt = buildStudyContentUserPrompt({ inputText, options });

  const ai = getClient();
  const model = getModelName();

  let response: GenerateContentResponse;
  try {
    response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        maxOutputTokens: 1400,
        responseMimeType: "application/json",
        // Keep schema simple and fully-supported by Gemini's JSON Schema subset.
        responseJsonSchema: {
          type: "object",
          additionalProperties: false,
          required: ["summary", "key_points", "questions", "flashcards"],
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            questions: { type: "array", items: { type: "string" } },
            flashcards: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["front", "back"],
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                },
              },
            },
          },
        },
      },
    });
  } catch (err) {
    throw mapGeminiError(err);
  }

  const text = responseText(response);
  return parseAndValidateStudyContent(text, options);
}

