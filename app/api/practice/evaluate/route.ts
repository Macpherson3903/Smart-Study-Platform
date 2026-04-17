import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserIdOrThrow } from "@/lib/auth";
import { evaluateAnswer } from "@/lib/ai/evaluateAnswer";
import { GeminiError } from "@/lib/gemini";

const evaluateRequestSchema = z
  .object({
    sessionId: z.string().min(1),
    questionIndex: z.number().int().min(0),
    question: z.string().min(1),
    referenceAnswer: z.string(),
    referenceKeyPoints: z.array(z.string()),
    userAnswer: z.string().min(1),
  })
  .strict();

function jsonError(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return jsonError("Unauthenticated", "UNAUTHENTICATED", 401);
  }

  // userId is available for future per-user rate limiting
  void userId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", "INVALID_JSON", 400);
  }

  const parsed = evaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request body", "INVALID_REQUEST", 400);
  }

  try {
    const result = await evaluateAnswer({
      question: parsed.data.question,
      referenceAnswer: parsed.data.referenceAnswer,
      referenceKeyPoints: parsed.data.referenceKeyPoints,
      userAnswer: parsed.data.userAnswer,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiError) {
      if (err.code === "GEMINI_RATE_LIMITED") {
        return jsonError(
          "Rate limited. Please try again shortly.",
          err.code,
          429,
        );
      }
      return jsonError(
        "Failed to evaluate answer. Please try again.",
        err.code,
        502,
      );
    }

    return jsonError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
