import { NextResponse } from "next/server";

import { getUserIdOrThrow } from "@/lib/auth";
import { userPreferencesUpdateSchema } from "@/lib/userPreferences";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/server/services/userPreferencesService";

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

export async function GET() {
  let userId: string;
  try {
    userId = await getUserIdOrThrow();
  } catch {
    return unauthenticated();
  }

  try {
    const preferences = await getUserPreferences({ userId });
    return NextResponse.json({
      success: true,
      message: "Settings fetched successfully.",
      preferences,
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

export async function PUT(req: Request) {
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

  const parsed = userPreferencesUpdateSchema.safeParse(body);
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
    const preferences = await updateUserPreferences({
      userId,
      patch: parsed.data,
    });
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      preferences,
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
