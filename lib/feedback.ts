import { z } from "zod";

export const feedbackRatingSchema = z
  .number()
  .int()
  .min(1)
  .max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>;

export const feedbackDisplayNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(50)
  .default("Smart Study User");

export const feedbackContentSchema = z.string().trim().min(3).max(1_000);

export const createFeedbackReviewSchema = z
  .object({
    displayName: feedbackDisplayNameSchema.optional(),
    rating: feedbackRatingSchema,
    content: feedbackContentSchema,
  })
  .strict();

export const listFeedbackReviewsQuerySchema = z
  .object({
    limit: z.number().int().min(1).max(20).optional(),
    cursor: z.string().trim().min(1).optional(),
  })
  .strict();

export const createFeedbackCommentSchema = z
  .object({
    reviewId: z.string().trim().min(1),
    parentCommentId: z.string().trim().min(1).optional(),
    displayName: feedbackDisplayNameSchema.optional(),
    content: feedbackContentSchema,
  })
  .strict();

export const listFeedbackCommentsQuerySchema = z
  .object({
    reviewId: z.string().trim().min(1),
  })
  .strict();
