import { NextResponse } from "next/server";

import {
  createFeedbackCommentSchema,
  listFeedbackCommentsQuerySchema,
} from "@/lib/feedback";
import { getUserIdOrThrow } from "@/lib/auth";
import {
  createFeedbackComment,
  FeedbackServiceError,
  listFeedbackComments,
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
  const parsed = listFeedbackCommentsQuerySchema.safeParse({
    reviewId: url.searchParams.get("reviewId"),
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
    const comments = await listFeedbackComments({ reviewId: parsed.data.reviewId });
    return NextResponse.json({
      success: true,
      message: "Comments fetched successfully.",
      comments,
    });
  } catch (err) {
    if (err instanceof FeedbackServiceError && err.code === "INVALID_REVIEW") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid review id",
          message: "Invalid review id",
          code: "INVALID_REVIEW",
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

  const parsed = createFeedbackCommentSchema.safeParse(body);
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
    const comment = await createFeedbackComment({
      userId,
      reviewId: parsed.data.reviewId,
      parentCommentId: parsed.data.parentCommentId,
      displayName: parsed.data.displayName ?? "Smart Study User",
      content: parsed.data.content,
    });
    return NextResponse.json(
      {
        success: true,
        message: "Comment posted successfully.",
        comment,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof FeedbackServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
          message: err.message,
          code: err.code,
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
