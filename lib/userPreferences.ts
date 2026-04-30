import { z } from "zod";

import { generateOptionsSchema } from "@/lib/ai/studyContentSchema";

const supportPromptPreferencesSchema = z
  .object({
    lastShownAt: z.string().datetime().nullable().default(null),
    lastPromptedCompletedCount: z.number().int().min(0).default(0),
    lastPromptedAuthSessionId: z.string().default(""),
  })
  .strict();

export const userPreferencesSchema = z
  .object({
    defaultGenerateOptions: generateOptionsSchema,
    autoFocusStudyInput: z.boolean().default(true),
    supportPrompt: supportPromptPreferencesSchema,
  })
  .strict();

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const defaultUserPreferences: UserPreferences = {
  defaultGenerateOptions: {
    summary: true,
    questions: true,
    flashcards: true,
  },
  autoFocusStudyInput: true,
  supportPrompt: {
    lastShownAt: null,
    lastPromptedCompletedCount: 0,
    lastPromptedAuthSessionId: "",
  },
};

export const userPreferencesUpdateSchema = userPreferencesSchema
  .partial()
  .strict();

export function mergeUserPreferences(
  partial: Partial<UserPreferences> | null | undefined,
): UserPreferences {
  return {
    defaultGenerateOptions: {
      ...defaultUserPreferences.defaultGenerateOptions,
      ...(partial?.defaultGenerateOptions ?? {}),
    },
    autoFocusStudyInput:
      partial?.autoFocusStudyInput ??
      defaultUserPreferences.autoFocusStudyInput,
    supportPrompt: {
      ...defaultUserPreferences.supportPrompt,
      ...(partial?.supportPrompt ?? {}),
    },
  };
}
