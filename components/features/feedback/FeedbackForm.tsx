"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { StarRatingInput } from "@/components/features/feedback/StarRatingInput";

export function FeedbackForm(props: {
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onSubmit: (input: {
    displayName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    content: string;
  }) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const trimmedContent = content.trim();
    if (trimmedContent.length < 3) {
      setError("Please write at least 3 characters.");
      return;
    }
    setError(null);
    await props.onSubmit({
      displayName: displayName.trim(),
      rating,
      content: trimmedContent,
    });
    setContent("");
  }

  return (
    <Card id="post-review">
      <CardHeader>
        <h2 className="text-lg font-semibold text-white">Share your feedback</h2>
        <p className="mt-1 text-sm text-white">
          Rate your experience and help other learners.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!props.isAuthenticated ? (
          <Alert
            tone="info"
            title="Sign in to post feedback"
            description="You need an account to post reviews, comments, and replies."
            action={{
              label: "Sign in",
              onClick: () => {
                window.location.href = "/sign-in";
              },
            }}
          />
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white" htmlFor="name">
                Display name
              </label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="Smart Study User"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">Rating</p>
              <StarRatingInput
                value={rating}
                onChange={setRating}
                disabled={props.isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-white"
                htmlFor="feedback-content"
              >
                Review
              </label>
              <Textarea
                id="feedback-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What worked well for you, and what should improve?"
                maxLength={1000}
                className="min-h-28"
              />
              <p className="text-xs text-white">{content.length}/1000</p>
            </div>
            {error ? <Alert tone="error" title="Invalid review" description={error} /> : null}
            <Button isLoading={props.isSubmitting} onClick={() => void submit()}>
              Post review
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
