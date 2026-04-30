"use client";

import { useMemo, useState } from "react";

import type { FeedbackCommentListItem } from "@/models/Feedback";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type CommentNode = FeedbackCommentListItem & { replies: FeedbackCommentListItem[] };

export function CommentThread(props: {
  reviewId: string;
  comments: FeedbackCommentListItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
  onLoadComments: (reviewId: string) => Promise<void>;
  onPostComment: (input: {
    reviewId: string;
    parentCommentId?: string;
    displayName: string;
    content: string;
  }) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [displayName, setDisplayName] = useState("");

  const tree = useMemo(() => {
    const roots: CommentNode[] = [];
    const byId = new Map<string, CommentNode>();
    for (const comment of props.comments) {
      byId.set(comment.id, { ...comment, replies: [] });
    }
    for (const node of byId.values()) {
      if (node.parentCommentId) {
        const parent = byId.get(node.parentCommentId);
        if (parent) {
          parent.replies.push(node);
          continue;
        }
      }
      roots.push(node);
    }
    return roots;
  }, [props.comments]);

  async function toggleOpen() {
    const next = !isOpen;
    setIsOpen(next);
    if (next && props.comments.length === 0) {
      await props.onLoadComments(props.reviewId);
    }
  }

  async function submitComment() {
    const content = commentText.trim();
    if (!content) return;
    await props.onPostComment({
      reviewId: props.reviewId,
      displayName: displayName.trim(),
      content,
    });
    setCommentText("");
  }

  async function submitReply(parentCommentId: string) {
    const content = replyMap[parentCommentId]?.trim();
    if (!content) return;
    await props.onPostComment({
      reviewId: props.reviewId,
      parentCommentId,
      displayName: displayName.trim(),
      content,
    });
    setReplyMap((current) => ({ ...current, [parentCommentId]: "" }));
  }

  return (
    <div className="mt-4 rounded-lg border border-purple-300/20 p-3">
      <Button variant="secondary" size="sm" onClick={() => void toggleOpen()}>
        {isOpen ? "Hide comments" : `View comments (${props.comments.length})`}
      </Button>

      {isOpen ? (
        <div className="mt-4 space-y-3">
          {!props.isAuthenticated ? (
            <Alert
              tone="info"
              title="Sign in to comment"
              description="Only authenticated users can post comments and replies."
            />
          ) : (
            <div className="space-y-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="Display name (optional)"
              />
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment"
                maxLength={1000}
              />
              <Button
                size="sm"
                isLoading={props.isLoading}
                onClick={() => void submitComment()}
              >
                Post comment
              </Button>
            </div>
          )}

          {tree.length === 0 ? (
            <p className="text-sm text-white">No comments yet.</p>
          ) : (
            <ul className="space-y-3">
              {tree.map((comment) => (
                <li key={comment.id} className="space-y-2 rounded-md bg-black/25 p-3">
                  <p className="text-sm font-semibold text-white">
                    {comment.displayName}
                  </p>
                  <p className="text-sm text-white">{comment.content}</p>

                  {props.isAuthenticated ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={replyMap[comment.id] ?? ""}
                        onChange={(e) =>
                          setReplyMap((current) => ({
                            ...current,
                            [comment.id]: e.target.value,
                          }))
                        }
                        placeholder="Reply..."
                        maxLength={1000}
                        className="max-w-sm"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={props.isLoading}
                        onClick={() => void submitReply(comment.id)}
                      >
                        Reply
                      </Button>
                    </div>
                  ) : null}

                  {comment.replies.length > 0 ? (
                    <ul className="space-y-2 border-l border-purple-300/20 pl-3">
                      {comment.replies.map((reply) => (
                        <li key={reply.id}>
                          <p className="text-sm font-semibold text-white">
                            {reply.displayName}
                          </p>
                          <p className="text-sm text-white">{reply.content}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
