import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdOrThrow } from "@/lib/auth";
import { generateOptionsSchema } from "@/lib/ai/studyContentSchema";
import { GeminiError } from "@/lib/gemini";
import { generateStudySession } from "@/server/services/studyGenerationService";

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

  const userId = await getUserIdOrThrow();

  if (parsed.data.userId && parsed.data.userId !== userId) {
    return jsonError("Forbidden", "USER_MISMATCH", 403, requestId);
  }

  try {
    const created = await generateStudySession({
      userId,
      inputText: parsed.data.inputText,
      options: parsed.data.options,
      idempotencyKey: parsed.data.idempotencyKey,
    });

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

    return jsonError(
      "Internal server error",
      "INTERNAL_ERROR",
      500,
      requestId,
      { "x-request-id": requestId },
    );
  }
}

