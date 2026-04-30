import type { Document } from "mongodb";

export const FEEDBACK_COLLECTION = "feedback" as const;

export type FeedbackKind = "review" | "comment";

interface FeedbackBaseDocument extends Document {
  kind: FeedbackKind;
  userId: string;
  displayName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackReviewDocument extends FeedbackBaseDocument {
  kind: "review";
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface FeedbackCommentDocument extends FeedbackBaseDocument {
  kind: "comment";
  reviewId: string;
  parentCommentId?: string;
}

export type FeedbackDocument = FeedbackReviewDocument | FeedbackCommentDocument;

export interface FeedbackReviewListItem {
  id: string;
  userId: string;
  displayName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCommentListItem {
  id: string;
  reviewId: string;
  parentCommentId?: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
