import { NextResponse } from "next/server";

import { getUserIdOrThrow } from "@/lib/auth";
import {
  deleteStudySession,
  getStudySessionById,
} from "@/server/services/studySessionService";

function authError() {
  return NextResponse.json(
    { error: "Unauthenticated", code: "UNAUTHENTICATED" },
    { status: 401 },
  );
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return authError();
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

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return authError();
  }

  const { id } = await ctx.params;
  const deleted = await deleteStudySession({ userId, id });

  if (!deleted) {
    return NextResponse.json(
      { error: "Not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
