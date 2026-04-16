import { NextResponse } from "next/server";

import { getUserIdOrThrow } from "@/lib/auth";
import { getStudySessionById } from "@/server/services/studySessionService";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return NextResponse.json(
      { error: "Unauthenticated", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;

  const session = await getStudySessionById({
    userId,
    id,
    includeResult: true,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  return NextResponse.json(session);
}

