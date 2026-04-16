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

  constructor(code: GeminiErrorCode);
  constructor(input: {
    message: string;
    code: GeminiErrorCode;
    status?: number;
    retryAfterSeconds?: number;
    cause?: unknown;
  });
  constructor(
    input:
      | GeminiErrorCode
      | {
          message: string;
          code: GeminiErrorCode;
          status?: number;
          retryAfterSeconds?: number;
          cause?: unknown;
        },
  ) {
    if (typeof input === "string") {
      super(input);
      this.name = "GeminiError";
      this.code = input;
      return;
    }

    super(input.message);
    this.name = "GeminiError";
    this.code = input.code;
    this.status = input.status;
    this.retryAfterSeconds = input.retryAfterSeconds;
    this.cause = input.cause;
  }
}

export type NormalizedGeminiCompletion = {
  id: string;
  result: { content: string };
  status: "complete";
};

/** Primary → fallback → backup (Gemini API model resource names). */
export const MODELS = [
  "models/gemini-3.1-flash-lite-preview",
] as const;

const RETRY_BACKOFF_MS = [2000, 5000, 10_000] as const;
const ATTEMPTS_PER_MODEL = 1 + RETRY_BACKOFF_MS.length;

function getClient(): GoogleGenAI {
  // The SDK is lightweight, but we keep a tiny singleton to avoid re-init churn.
  const apiKey = env.GEMINI_API_KEY();
  return new GoogleGenAI({ apiKey });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkishFailure(err: unknown): boolean {
  if (!err) return false;
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  const cause =
    typeof err === "object" && err !== null && "cause" in err
      ? (err as { cause: unknown }).cause
      : undefined;
  const causeCode =
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    typeof (cause as { code: unknown }).code === "string"
      ? String((cause as { code: string }).code)
      : "";

  const codes = new Set(
    [code, causeCode].filter(Boolean).map((c) => c.toUpperCase()),
  );
  if (
    codes.has("ECONNRESET") ||
    codes.has("ETIMEDOUT") ||
    codes.has("ENOTFOUND") ||
    codes.has("EAI_AGAIN") ||
    codes.has("ECONNREFUSED") ||
    codes.has("UND_ERR_SOCKET")
  ) {
    return true;
  }

  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  return /fetch failed|network|socket|ECONNRESET|ENOTFOUND|ETIMEDOUT|ECONNREFUSED/i.test(
    message,
  );
}

function isRetryableForResilience(err: unknown): boolean {
  if (isNetworkishFailure(err)) return true;

  if (!(err instanceof GeminiError)) return false;

  if (isNetworkishFailure(err.cause)) return true;

  if (err.code === "GEMINI_UNKNOWN") {
    const msg = err.message.toLowerCase();
    if (
      /fetch failed|network|socket|econnreset|etimedout|enotfound|eai_again|unavailable/i.test(
        msg,
      )
    ) {
      return true;
    }
  }

  if (err.code === "GEMINI_INVALID_RESPONSE") return true;

  if (err.code === "GEMINI_TIMEOUT") return true;

  if (err.code === "GEMINI_UNAVAILABLE") {
    const s = err.status;
    if (s === 503) return true;
    if (typeof s === "number" && s >= 500) return true;
    const msg = err.message.toLowerCase();
    if (/503|unavailable|overload|high demand|try again later/i.test(msg)) {
      return true;
    }
  }

  return false;
}

function getHttpStatus(err: unknown): number | undefined {
  if (err instanceof ApiError && typeof err.status === "number") return err.status;
  if (err instanceof GeminiError && typeof err.status === "number") return err.status;
  if (typeof (err as { status?: unknown } | undefined)?.status === "number") {
    return (err as { status: number }).status;
  }
  return undefined;
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

function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

function logGeminiResponseDevOnly(response: unknown): void {
  if (!isDevelopment()) return;
  console.log("[gemini] raw response", response);
}

function getGeminiResponsePayload(response: unknown): unknown {
  if (!response || typeof response !== "object") return response;

  const res = response as {
    candidates?: unknown;
    promptFeedback?: unknown;
    response?: unknown;
  };

  const candidates = res.candidates;
  const hasTopLevelCandidates = Array.isArray(candidates) && candidates.length > 0;
  const hasTopLevelPromptFeedback =
    Boolean(res.promptFeedback) && typeof res.promptFeedback === "object";

  if (hasTopLevelCandidates || hasTopLevelPromptFeedback) return response;

  if (res.response && typeof res.response === "object") return res.response;

  return response;
}

type GeminiCandidatePart = { text?: unknown };
type GeminiCandidateContent = { parts?: unknown };
type GeminiCandidate = { content?: unknown };
type GeminiPayloadShape = {
  candidates?: unknown;
};

function normalizeGeminiResponse(
  response: unknown,
  sessionId?: string,
): NormalizedGeminiCompletion {
  const payload = getGeminiResponsePayload(response) as GeminiPayloadShape | undefined;

  const candidates = payload?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new GeminiError("GEMINI_INVALID_RESPONSE");
  }

  const first = candidates[0] as GeminiCandidate | undefined;
  const content = first?.content as GeminiCandidateContent | undefined;
  const parts = content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new GeminiError("GEMINI_INVALID_RESPONSE");
  }

  const text = (parts[0] as GeminiCandidatePart | undefined)?.text;

  if (text === undefined || text === null) {
    throw new GeminiError("GEMINI_INVALID_RESPONSE");
  }

  if (typeof text !== "string") {
    throw new GeminiError("GEMINI_INVALID_RESPONSE");
  }

  if (!text.trim()) {
    throw new GeminiError("GEMINI_INVALID_RESPONSE");
  }

  return {
    id: sessionId ?? crypto.randomUUID(),
    status: "complete",
    result: { content: text },
  };
}

function isBlockedResponse(response: GenerateContentResponse): boolean {
  const payload = getGeminiResponsePayload(response);
  const res = payload as unknown as {
    promptFeedback?: unknown;
    candidates?: unknown;
  };

  const candidates = res.candidates;
  const hasCandidates = Array.isArray(candidates) && candidates.length > 0;
  if (hasCandidates) return false;

  const promptFeedback = res.promptFeedback as
    | { blockReason?: unknown; blockReasonMessage?: unknown }
    | undefined;

  if (!promptFeedback) return false;

  const blockReason = promptFeedback.blockReason;
  const blockReasonMessage = promptFeedback.blockReasonMessage;

  return Boolean(blockReason || blockReasonMessage);
}

function blockedReasonMessage(response: GenerateContentResponse): string {
  const payload = getGeminiResponsePayload(response);
  const res = payload as unknown as {
    promptFeedback?: unknown;
  };

  const promptFeedback = res.promptFeedback as
    | { blockReason?: unknown; blockReasonMessage?: unknown }
    | undefined;

  const reason =
    typeof promptFeedback?.blockReasonMessage === "string"
      ? promptFeedback.blockReasonMessage
      : typeof promptFeedback?.blockReason === "string"
        ? promptFeedback.blockReason
        : "SAFETY";

  return `Your request could not be processed safely (${reason}).`;
}

export type GenerateStudyContentContext = {
  /** Mongo session id (or any stable id) for normalized Gemini completion objects. */
  sessionId?: string;
};

export async function generateStudyContent(
  inputText: string,
  optionsInput?: Partial<GenerateOptions>,
  context?: GenerateStudyContentContext,
): Promise<{ content: StudyContent; modelUsed: string }> {
  const options = generateOptionsSchema.parse(optionsInput ?? {});
  const sessionId = context?.sessionId;

  const systemInstruction = buildStudyContentSystemPrompt();
  const userPrompt = buildStudyContentUserPrompt({ inputText, options });

  const ai = getClient();

  const baseConfig = {
    systemInstruction,
    temperature: 0.2,
    maxOutputTokens: 2000,
  } as const;

  const schemaConfig = {
    ...baseConfig,
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
  } as const;

  const jsonOnlyConfig = {
    ...baseConfig,
    temperature: 0,
    responseMimeType: "application/json",
  } as const;

  const callModelWithConfig = async (input: {
    model: string;
    config: Record<string, unknown>;
  }): Promise<StudyContent> => {
    let response: GenerateContentResponse;
    try {
      response = await ai.models.generateContent({
        model: input.model,
        contents: userPrompt,
        config: input.config,
      });
    } catch (err) {
      throw mapGeminiError(err);
    }

    logGeminiResponseDevOnly(response);

    if (isBlockedResponse(response)) {
      throw new GeminiError({
        code: "GEMINI_SAFETY_BLOCKED",
        message: blockedReasonMessage(response),
      });
    }

    const normalized = normalizeGeminiResponse(response, sessionId);
    return parseAndValidateStudyContent(normalized.result.content, options);
  };

  const trySchemaThenJsonMime = async (model: string): Promise<StudyContent> => {
    try {
      return await callModelWithConfig({
        model,
        config: schemaConfig as unknown as Record<string, unknown>,
      });
    } catch (err) {
      if (err instanceof GeminiError && err.code === "GEMINI_INVALID_RESPONSE") {
        return await callModelWithConfig({
          model,
          config: jsonOnlyConfig as unknown as Record<string, unknown>,
        });
      }
      throw err;
    }
  };

  let lastFailure: unknown;

  for (let m = 0; m < MODELS.length; m++) {
    const model = MODELS[m]!;
    console.log(`[AI] Trying model: ${model}`);

    for (let attempt = 0; attempt < ATTEMPTS_PER_MODEL; attempt++) {
      if (attempt > 0) {
        const delayMs = RETRY_BACKOFF_MS[attempt - 1]!;
        console.log(`[AI] Retry ${attempt} for ${model}`);
        console.log(
          `[AI] Backoff ${delayMs}ms before retry (last: ${String(
            lastFailure instanceof Error ? lastFailure.message : lastFailure,
          )})`,
        );
        await sleep(delayMs);
      }

      try {
        const content = await trySchemaThenJsonMime(model);
        return { content, modelUsed: model };
      } catch (err) {
        lastFailure = err;

        const status = getHttpStatus(err);
        const code = err instanceof GeminiError ? err.code : "n/a";
        console.log(
          `[AI] Attempt failed model=${model} attempt=${attempt + 1}/${ATTEMPTS_PER_MODEL} status=${String(status ?? "n/a")} code=${code}`,
        );

        if (err instanceof GeminiError && err.code === "GEMINI_RATE_LIMITED") {
          throw err;
        }
        if (err instanceof GeminiError && err.code === "GEMINI_SAFETY_BLOCKED") {
          throw err;
        }

        const retryable = isRetryableForResilience(err);
        const hasMoreAttemptsOnModel = attempt < ATTEMPTS_PER_MODEL - 1;
        if (retryable && hasMoreAttemptsOnModel) {
          continue;
        }

        break;
      }
    }

    if (m < MODELS.length - 1) {
      console.log("[AI] Switching to fallback model");
    }
  }

  console.log(
    `[AI] Final failure after all models exhausted: ${String(
      lastFailure instanceof Error ? lastFailure.message : lastFailure,
    )}`,
  );

  throw new GeminiError("GEMINI_UNAVAILABLE");
}

