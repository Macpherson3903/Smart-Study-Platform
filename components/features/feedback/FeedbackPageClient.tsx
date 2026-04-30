"use client";

import { useState } from "react";

import type {
  FeedbackCommentListItem,
  FeedbackReviewListItem,
} from "@/models/Feedback";

import { FeedbackForm } from "@/components/features/feedback/FeedbackForm";
import { FeedbackList } from "@/components/features/feedback/FeedbackList";
import { toast } from "@/lib/toast";

type PageInfo = { hasMore: boolean; nextCursor?: string };

export function FeedbackPageClient(props: {
  initialReviews: FeedbackReviewListItem[];
  initialPageInfo: PageInfo;
  isAuthenticated: boolean;
}) {
  const [reviews, setReviews] = useState(props.initialReviews);
  const [pageInfo, setPageInfo] = useState(props.initialPageInfo);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [commentsByReviewId, setCommentsByReviewId] = useState<
    Record<string, FeedbackCommentListItem[]>
  >({});

  async function createReview(input: {
    displayName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    content: string;
  }) {
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as
        | { review?: FeedbackReviewListItem; error?: string; message?: string }
        | undefined;
      if (!res.ok || !json?.review) {
        throw new Error(json?.error ?? json?.message ?? "Failed to post review.");
      }
      setReviews((current) => [json.review as FeedbackReviewListItem, ...current]);
      toast.success("Review posted");
    } catch (error) {
      toast.error("Couldn’t post review", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function loadMoreReviews() {
    if (!pageInfo.hasMore || !pageInfo.nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "10");
      params.set("cursor", pageInfo.nextCursor);
      const res = await fetch(`/api/feedback?${params.toString()}`);
      const json = (await res.json()) as
        | {
            reviews?: FeedbackReviewListItem[];
            pageInfo?: PageInfo;
            error?: string;
            message?: string;
          }
        | undefined;
      if (!res.ok || !json?.reviews || !json?.pageInfo) {
        throw new Error(json?.error ?? json?.message ?? "Failed to load reviews.");
      }
      const nextReviews = json.reviews;
      const nextPageInfo = json.pageInfo;
      setReviews((current) => [...current, ...nextReviews]);
      setPageInfo(nextPageInfo);
    } catch (error) {
      toast.error("Couldn’t load more reviews", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function loadComments(reviewId: string) {
    if (commentsByReviewId[reviewId]) return;
    try {
      const params = new URLSearchParams();
      params.set("reviewId", reviewId);
      const res = await fetch(`/api/feedback/comments?${params.toString()}`);
      const json = (await res.json()) as
        | { comments?: FeedbackCommentListItem[]; error?: string; message?: string }
        | undefined;
      if (!res.ok || !json?.comments) {
        throw new Error(json?.error ?? json?.message ?? "Failed to fetch comments.");
      }
      setCommentsByReviewId((current) => ({ ...current, [reviewId]: json.comments ?? [] }));
    } catch (error) {
      toast.error("Couldn’t load comments", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async function postComment(input: {
    reviewId: string;
    parentCommentId?: string;
    displayName: string;
    content: string;
  }) {
    setIsCommentSubmitting(true);
    try {
      const res = await fetch("/api/feedback/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as
        | { comment?: FeedbackCommentListItem; error?: string; message?: string }
        | undefined;
      if (!res.ok || !json?.comment) {
        throw new Error(json?.error ?? json?.message ?? "Failed to post comment.");
      }
      setCommentsByReviewId((current) => ({
        ...current,
        [input.reviewId]: [...(current[input.reviewId] ?? []), json.comment as FeedbackCommentListItem],
      }));
      toast.success("Comment posted");
    } catch (error) {
      toast.error("Couldn’t post comment", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <FeedbackForm
        isAuthenticated={props.isAuthenticated}
        isSubmitting={isSubmittingReview}
        onSubmit={createReview}
      />
      <FeedbackList
        reviews={reviews}
        commentsByReviewId={commentsByReviewId}
        canLoadMore={pageInfo.hasMore && typeof pageInfo.nextCursor === "string"}
        isLoadingMore={isLoadingMore}
        isAuthenticated={props.isAuthenticated}
        isCommentSubmitting={isCommentSubmitting}
        onLoadMore={loadMoreReviews}
        onLoadComments={loadComments}
        onPostComment={postComment}
      />
    </div>
  );
}
