import { NextResponse } from "next/server";
import { getUserIdOrThrow } from "@/lib/auth";
import { listStudySessions } from "@/server/services/studySessionService";

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return NextResponse.json(
      { error: "Unauthenticated", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const includeResultParam = url.searchParams.get("includeResult");
  const includeResult =
    includeResultParam === null ? undefined : includeResultParam !== "0";

  try {
    const result = await listStudySessions({
      userId,
      limit: Number.isFinite(limit) ? limit : undefined,
      cursor,
      includeResult,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid cursor") {
      return NextResponse.json(
        { error: "Invalid cursor", code: "INVALID_CURSOR" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
