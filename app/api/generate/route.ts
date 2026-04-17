import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdOrThrow } from "@/lib/auth";
import { generateOptionsSchema } from "@/lib/ai/studyContentSchema";
import { GeminiError } from "@/lib/gemini";
import { logger } from "@/lib/logger";
import { generateStudySession } from "@/server/services/studyGenerationService";
import { consumeGenerateQuota } from "@/server/services/rateLimitService";

const REQUEST_MAX_CHARS = 20_000;

const generateRequestSchema = z
  .object({
    userId: z.string().optional(),
    inputText: z.string().min(1).max(REQUEST_MAX_CHARS),
    options: generateOptionsSchema.optional(),
    idempotencyKey: z.string().min(1).max(200).optional(),
  })
  .strict();

function jsonError(
  message: string,
  code: string,
  status: number,
  requestId?: string,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    { error: message, code, requestId },
    { status, headers },
  );
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", "INVALID_JSON", 400, requestId);
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request body", "INVALID_REQUEST", 400, requestId);
  }

  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return jsonError("Unauthenticated", "UNAUTHENTICATED", 401, requestId, {
      "x-request-id": requestId,
    });
  }

  if (parsed.data.userId && parsed.data.userId !== userId) {
    return jsonError("Forbidden", "USER_MISMATCH", 403, requestId);
  }

  // Per-user AI generation quota. Enforced BEFORE any paid work. Signed-in
  // users are bucketed; unauthenticated requests never reach this point.
  const quota = await consumeGenerateQuota({ userId });
  if (!quota.allowed) {
    logger.warn("generate.rate_limited", {
      userId,
      reason: quota.reason,
      limit: quota.limit,
      requestId,
    });
    const headers: HeadersInit = {
      "x-request-id": requestId,
      "retry-after": String(quota.retryAfterSeconds),
      "x-ratelimit-limit": String(quota.limit),
      "x-ratelimit-scope": quota.reason.toLowerCase(),
    };
    const message =
      quota.reason === "DAILY"
        ? "You've hit your daily generation limit. Try again tomorrow."
        : "You're generating too quickly. Please slow down and try again in a moment.";
    return jsonError(
      message,
      quota.reason === "DAILY" ? "RATE_LIMITED_DAILY" : "RATE_LIMITED_BURST",
      429,
      requestId,
      headers,
    );
  }

  try {
    const created = await generateStudySession({
      userId,
      inputText: parsed.data.inputText,
      options: parsed.data.options,
      idempotencyKey: parsed.data.idempotencyKey,
    });

    if (created.status !== "complete") {
      return jsonError(
        created.status === "pending"
          ? "Your session is still generating. Please try again shortly."
          : created.error.message,
        created.status === "pending" ? "SESSION_PENDING" : created.error.code,
        created.status === "pending" ? 202 : 409,
        requestId,
        { "x-request-id": requestId },
      );
    }

    // Content is already validated inside generateStudyContent via
    // studyContentSchema before it is persisted, so we trust it here and
    // avoid the redundant safeParse.
    return NextResponse.json(
      { id: created.id, content: created.result.content },
      {
        status: 201,
        headers: { "x-request-id": requestId },
      },
    );
  } catch (err) {
    if (err instanceof GeminiError) {
      if (err.code === "GEMINI_RATE_LIMITED") {
        const headers: HeadersInit = { "x-request-id": requestId };
        if (typeof err.retryAfterSeconds === "number") {
          headers["retry-after"] = String(err.retryAfterSeconds);
        }
        return jsonError(
          "Rate limited. Please try again shortly.",
          err.code,
          429,
          requestId,
          headers,
        );
      }

      if (err.code === "GEMINI_SAFETY_BLOCKED") {
        return jsonError(
          "Your request could not be processed safely.",
          err.code,
          400,
          requestId,
          { "x-request-id": requestId },
        );
      }

      if (err.code === "GEMINI_INVALID_RESPONSE") {
        return jsonError(
          "The AI service returned an invalid response. Please try again.",
          err.code,
          502,
          requestId,
          { "x-request-id": requestId },
        );
      }

      return jsonError(
        "AI service unavailable. Please try again.",
        err.code,
        502,
        requestId,
        { "x-request-id": requestId },
      );
    }

    logger.exception(err, { route: "api.generate", userId, requestId });
    return jsonError(
      "Internal server error",
      "INTERNAL_ERROR",
      500,
      requestId,
      { "x-request-id": requestId },
    );
  }
}
