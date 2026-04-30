import { NextResponse } from "next/server";

import { getUserIdOrThrow } from "@/lib/auth";
import { evaluateSupportPrompt } from "@/server/services/supportPromptService";

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

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return unauthenticated();
  }

  try {
    const url = new URL(req.url);
    const authSessionId = url.searchParams.get("authSessionId") ?? undefined;
    const result = await evaluateSupportPrompt({ userId, authSessionId });

    return NextResponse.json({
      success: true,
      message: "Support prompt eligibility fetched successfully.",
      ...result,
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
