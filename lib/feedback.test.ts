import { describe, expect, it } from "vitest";

import {
  createFeedbackCommentSchema,
  createFeedbackReviewSchema,
} from "@/lib/feedback";

describe("feedback schemas", () => {
  it("accepts a valid review payload", () => {
    const parsed = createFeedbackReviewSchema.safeParse({
      displayName: "Ada",
      rating: 5,
      content: "Great platform for quick study sessions.",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects review rating outside bounds", () => {
    const parsed = createFeedbackReviewSchema.safeParse({
      rating: 6,
      content: "Too high",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts reply payload with parent comment", () => {
    const parsed = createFeedbackCommentSchema.safeParse({
      reviewId: "680fcb9a9f57040fdc1541e9",
      parentCommentId: "680fcb9a9f57040fdc1541ea",
      content: "Helpful review, thanks.",
    });
    expect(parsed.success).toBe(true);
  });
});
