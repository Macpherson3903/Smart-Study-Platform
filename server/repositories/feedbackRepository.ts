import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { getDb } from "@/lib/mongodb";
import {
  FEEDBACK_COLLECTION,
  type FeedbackCommentDocument,
  type FeedbackDocument,
  type FeedbackReviewDocument,
} from "@/models/Feedback";

async function getCollection(): Promise<Collection<FeedbackDocument>> {
  const db = await getDb();
  return db.collection<FeedbackDocument>(FEEDBACK_COLLECTION);
}

export async function ensureFeedbackIndexes(): Promise<void> {
  const col = await getCollection();
  await col.createIndex({ kind: 1, createdAt: -1, _id: -1 });
  await col.createIndex({ kind: 1, rating: -1, createdAt: -1 });
  await col.createIndex({ kind: 1, reviewId: 1, createdAt: 1 });
  await col.createIndex({ kind: 1, parentCommentId: 1, createdAt: 1 });
}

export type FeedbackReviewCursor = { createdAt: Date; id: ObjectId };

export async function insertReview(input: {
  userId: string;
  displayName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
}): Promise<FeedbackReviewDocument & { _id: ObjectId }> {
  const col = await getCollection();
  const now = new Date();
  const doc: FeedbackReviewDocument = {
    kind: "review",
    userId: input.userId,
    displayName: input.displayName,
    rating: input.rating,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function listReviewsPaginated(input: {
  limit: number;
  cursor?: FeedbackReviewCursor;
}): Promise<{
  reviews: Array<FeedbackReviewDocument & { _id: ObjectId }>;
  hasMore: boolean;
  nextCursor?: FeedbackReviewCursor;
}> {
  const col = await getCollection();
  const filter: Record<string, unknown> = { kind: "review" };
  if (input.cursor) {
    filter["$or"] = [
      { createdAt: { $lt: input.cursor.createdAt } },
      { createdAt: input.cursor.createdAt, _id: { $lt: input.cursor.id } },
    ];
  }

  const docs = await col
    .find<FeedbackReviewDocument & { _id: ObjectId }>(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(input.limit + 1)
    .toArray();

  const hasMore = docs.length > input.limit;
  const page = hasMore ? docs.slice(0, input.limit) : docs;
  const last = page.at(-1);
  const nextCursor = last
    ? { createdAt: last.createdAt, id: last._id }
    : undefined;
  return { reviews: page, hasMore, nextCursor };
}

export async function findReviewById(input: {
  id: ObjectId;
}): Promise<(FeedbackReviewDocument & { _id: ObjectId }) | null> {
  const col = await getCollection();
  return await col.findOne<FeedbackReviewDocument & { _id: ObjectId }>({
    _id: input.id,
    kind: "review",
  });
}

export async function insertComment(input: {
  userId: string;
  displayName: string;
  reviewId: string;
  parentCommentId?: string;
  content: string;
}): Promise<FeedbackCommentDocument & { _id: ObjectId }> {
  const col = await getCollection();
  const now = new Date();
  const doc: FeedbackCommentDocument = {
    kind: "comment",
    userId: input.userId,
    displayName: input.displayName,
    reviewId: input.reviewId,
    content: input.content,
    createdAt: now,
    updatedAt: now,
    ...(input.parentCommentId ? { parentCommentId: input.parentCommentId } : {}),
  };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function listCommentsByReviewId(input: {
  reviewId: string;
}): Promise<Array<FeedbackCommentDocument & { _id: ObjectId }>> {
  const col = await getCollection();
  return await col
    .find<FeedbackCommentDocument & { _id: ObjectId }>({
      kind: "comment",
      reviewId: input.reviewId,
    })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();
}

export async function listTopTestimonials(input: {
  minRating: 4 | 5;
  limit: number;
}): Promise<Array<FeedbackReviewDocument & { _id: ObjectId }>> {
  const col = await getCollection();
  return await col
    .find<FeedbackReviewDocument & { _id: ObjectId }>({
      kind: "review",
      rating: { $gte: input.minRating },
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(input.limit)
    .toArray();
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}
