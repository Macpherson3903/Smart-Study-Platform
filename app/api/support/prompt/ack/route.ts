import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserIdOrThrow } from "@/lib/auth";
import { countCompletedStudySessions } from "@/server/services/studySessionService";
import { acknowledgeSupportPrompt } from "@/server/services/supportPromptService";

const bodySchema = z
  .object({
    reason: z.enum(["auth", "every_2_sessions"]),
    authSessionId: z.string().min(1).max(200).optional(),
  })
  .strict();

function unauthenticated() {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthenticated",
      message: "Unauthenticated",
      code: "UNAUTHENTICATED",
    },
    { status: 401 },
  );
}

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return unauthenticated();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        message: "Invalid JSON body",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
        message: "Invalid request body",
        code: "INVALID_REQUEST",
      },
      { status: 400 },
    );
  }

  try {
    const completedCount = await countCompletedStudySessions({ userId });
    await acknowledgeSupportPrompt({
      userId,
      reason: parsed.data.reason,
      authSessionId: parsed.data.authSessionId,
      completedCount,
    });
    return NextResponse.json({
      success: true,
      message: "Support prompt state updated successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
