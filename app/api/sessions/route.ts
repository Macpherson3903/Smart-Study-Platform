import { NextResponse } from "next/server";
import { getUserIdOrThrow } from "@/lib/auth";
import {
  createUserSession,
  listUserSessions,
} from "@/server/services/userSessionService";

export async function GET(req: Request) {
  const userId = await getUserIdOrThrow();

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  const sessions = await listUserSessions({
    userId,
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const userId = await getUserIdOrThrow();

  const body: unknown = await req.json();
  if (
    !body ||
    typeof body !== "object" ||
    !("inputText" in body) ||
    typeof (body as { inputText: unknown }).inputText !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const inputText = (body as { inputText: string }).inputText;

  const result = await createUserSession({
    userId,
    inputText,
    generatedResult: { status: "placeholder" },
  });

  return NextResponse.json({ id: result.id }, { status: 201 });
}
