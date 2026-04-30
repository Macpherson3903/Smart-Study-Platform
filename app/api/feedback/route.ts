import { NextResponse } from "next/server";

import {
  createFeedbackReviewSchema,
  listFeedbackReviewsQuerySchema,
} from "@/lib/feedback";
import { getUserIdOrThrow } from "@/lib/auth";
import {
  createFeedbackReview,
  FeedbackServiceError,
  listFeedbackReviews,
} from "@/server/services/feedbackService";

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
  const url = new URL(req.url);
  const parsed = listFeedbackReviewsQuerySchema.safeParse({
    limit: url.searchParams.get("limit")
      ? Number(url.searchParams.get("limit"))
      : undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request query",
        message: "Invalid request query",
        code: "INVALID_REQUEST",
      },
      { status: 400 },
    );
  }

  try {
    const result = await listFeedbackReviews(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Feedback fetched successfully.",
      ...result,
    });
  } catch (err) {
    if (err instanceof FeedbackServiceError && err.code === "INVALID_CURSOR") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid cursor",
          message: "Invalid cursor",
          code: "INVALID_CURSOR",
        },
        { status: 400 },
      );
    }
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

  const parsed = createFeedbackReviewSchema.safeParse(body);
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
    const review = await createFeedbackReview({
      userId,
      displayName: parsed.data.displayName ?? "Smart Study User",
      rating: parsed.data.rating,
      content: parsed.data.content,
    });
    return NextResponse.json(
      {
        success: true,
        message: "Review posted successfully.",
        review,
      },
      { status: 201 },
    );
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
