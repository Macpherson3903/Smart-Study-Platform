import "server-only";

import { ObjectId } from "mongodb";
import { z } from "zod";

import type {
  FeedbackCommentListItem,
  FeedbackReviewListItem,
} from "@/models/Feedback";
import {
  ensureFeedbackIndexes,
  findReviewById,
  insertComment,
  insertReview,
  listCommentsByReviewId,
  listReviewsPaginated,
  listTopTestimonials,
  toObjectId,
  type FeedbackReviewCursor,
} from "@/server/repositories/feedbackRepository";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const HOME_TESTIMONIAL_LIMIT = 4;

const cursorPayloadSchema = z
  .object({
    createdAt: z.string(),
    id: z.string(),
  })
  .strict();

export class FeedbackServiceError extends Error {
  code: "INVALID_CURSOR" | "INVALID_REVIEW" | "INVALID_PARENT_COMMENT";

  constructor(
    code: "INVALID_CURSOR" | "INVALID_REVIEW" | "INVALID_PARENT_COMMENT",
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

function encodeCursor(cursor: FeedbackReviewCursor): string {
  return Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id.toString(),
    }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(encoded: string): FeedbackReviewCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    throw new FeedbackServiceError("INVALID_CURSOR", "Invalid cursor");
  }
  const valid = cursorPayloadSchema.safeParse(parsed);
  if (!valid.success) {
    throw new FeedbackServiceError("INVALID_CURSOR", "Invalid cursor");
  }
  const createdAt = new Date(valid.data.createdAt);
  if (!Number.isFinite(createdAt.getTime())) {
    throw new FeedbackServiceError("INVALID_CURSOR", "Invalid cursor");
  }
  if (!ObjectId.isValid(valid.data.id)) {
    throw new FeedbackServiceError("INVALID_CURSOR", "Invalid cursor");
  }
  return { createdAt, id: new ObjectId(valid.data.id) };
}

function toReviewListItem(review: {
  _id: ObjectId;
  userId: string;
  displayName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): FeedbackReviewListItem {
  return {
    id: review._id.toString(),
    userId: review.userId,
    displayName: review.displayName,
    rating: review.rating,
    content: review.content,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

function toCommentListItem(comment: {
  _id: ObjectId;
  reviewId: string;
  parentCommentId?: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): FeedbackCommentListItem {
  return {
    id: comment._id.toString(),
    reviewId: comment.reviewId,
    parentCommentId: comment.parentCommentId,
    userId: comment.userId,
    displayName: comment.displayName,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export async function createFeedbackReview(input: {
  userId: string;
  displayName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
}): Promise<FeedbackReviewListItem> {
  await ensureFeedbackIndexes();
  const review = await insertReview(input);
  return toReviewListItem(review);
}

export async function listFeedbackReviews(input: {
  limit?: number;
  cursor?: string;
}): Promise<{
  reviews: FeedbackReviewListItem[];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}> {
  await ensureFeedbackIndexes();
  const limit = Math.min(Math.max(input.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;

  const page = await listReviewsPaginated({ limit, cursor });
  return {
    reviews: page.reviews.map((review) => toReviewListItem(review)),
    pageInfo: {
      hasMore: page.hasMore,
      nextCursor:
        page.hasMore && page.nextCursor
          ? encodeCursor(page.nextCursor)
          : undefined,
    },
  };
}

export async function createFeedbackComment(input: {
  userId: string;
  displayName: string;
  reviewId: string;
  parentCommentId?: string;
  content: string;
}): Promise<FeedbackCommentListItem> {
  await ensureFeedbackIndexes();
  if (!ObjectId.isValid(input.reviewId)) {
    throw new FeedbackServiceError("INVALID_REVIEW", "Invalid review id");
  }
  const reviewId = toObjectId(input.reviewId);
  const review = await findReviewById({ id: reviewId });
  if (!review) {
    throw new FeedbackServiceError("INVALID_REVIEW", "Review not found");
  }

  if (input.parentCommentId && !ObjectId.isValid(input.parentCommentId)) {
    throw new FeedbackServiceError(
      "INVALID_PARENT_COMMENT",
      "Invalid parent comment id",
    );
  }

  const comment = await insertComment(input);
  return toCommentListItem(comment);
}

export async function listFeedbackComments(input: {
  reviewId: string;
}): Promise<FeedbackCommentListItem[]> {
  await ensureFeedbackIndexes();
  if (!ObjectId.isValid(input.reviewId)) {
    throw new FeedbackServiceError("INVALID_REVIEW", "Invalid review id");
  }

  const comments = await listCommentsByReviewId(input);
  return comments.map((comment) => toCommentListItem(comment));
}

export async function listFeedbackTestimonials(): Promise<
  FeedbackReviewListItem[]
> {
  await ensureFeedbackIndexes();
  const testimonials = await listTopTestimonials({
    minRating: 4,
    limit: HOME_TESTIMONIAL_LIMIT,
  });
  return testimonials.map((testimonial) => toReviewListItem(testimonial));
}
