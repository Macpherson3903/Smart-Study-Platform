"use client";

import type {
  FeedbackCommentListItem,
  FeedbackReviewListItem,
} from "@/models/Feedback";

import { CommentThread } from "@/components/features/feedback/CommentThread";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

function Stars(props: { value: number }) {
  return (
    <p className="text-amber-300" aria-label={`${props.value} out of 5 stars`}>
      {"★".repeat(props.value)}
      <span className="text-slate-500">{"★".repeat(5 - props.value)}</span>
    </p>
  );
}

export function FeedbackList(props: {
  reviews: FeedbackReviewListItem[];
  commentsByReviewId: Record<string, FeedbackCommentListItem[]>;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  isAuthenticated: boolean;
  isCommentSubmitting: boolean;
  onLoadMore: () => Promise<void>;
  onLoadComments: (reviewId: string) => Promise<void>;
  onPostComment: (input: {
    reviewId: string;
    parentCommentId?: string;
    displayName: string;
    content: string;
  }) => Promise<void>;
}) {
  if (props.reviews.length === 0) {
    return <p className="text-sm text-white">No feedback yet. Be the first to post.</p>;
  }

  return (
    <div className="space-y-4">
      {props.reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{review.displayName}</p>
                <p className="text-xs text-white">{review.createdAt.slice(0, 10)}</p>
              </div>
              <Stars value={review.rating} />
            </div>
            <p className="mt-3 text-sm text-white">{review.content}</p>

            <CommentThread
              reviewId={review.id}
              comments={props.commentsByReviewId[review.id] ?? []}
              isAuthenticated={props.isAuthenticated}
              isLoading={props.isCommentSubmitting}
              onLoadComments={props.onLoadComments}
              onPostComment={props.onPostComment}
            />
          </CardContent>
        </Card>
      ))}

      {props.canLoadMore ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            isLoading={props.isLoadingMore}
            onClick={() => void props.onLoadMore()}
          >
            Load more reviews
          </Button>
        </div>
      ) : null}
    </div>
  );
}
