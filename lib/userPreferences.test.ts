import { describe, expect, it } from "vitest";

import {
  defaultUserPreferences,
  mergeUserPreferences,
  userPreferencesSchema,
  userPreferencesUpdateSchema,
} from "./userPreferences";

describe("userPreferencesSchema", () => {
  it("parses defaults", () => {
    const parsed = userPreferencesSchema.parse(defaultUserPreferences);
    expect(parsed).toEqual(defaultUserPreferences);
  });

  it("rejects extra fields", () => {
    const parsed = userPreferencesSchema.safeParse({
      ...defaultUserPreferences,
      extra: true,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("userPreferencesUpdateSchema", () => {
  it("accepts partial updates", () => {
    const parsed = userPreferencesUpdateSchema.parse({
      defaultGenerateOptions: { summary: false },
    });
    expect(parsed.defaultGenerateOptions?.summary).toBe(false);
  });
});

describe("mergeUserPreferences", () => {
  it("fills missing values with defaults", () => {
    const merged = mergeUserPreferences({
      defaultGenerateOptions: {
        summary: false,
        questions: true,
        flashcards: true,
      },
    });
    expect(merged).toEqual({
      defaultGenerateOptions: {
        summary: false,
        questions: true,
        flashcards: true,
      },
      autoFocusStudyInput: true,
      supportPrompt: {
        lastShownAt: null,
        lastPromptedCompletedCount: 0,
        lastPromptedAuthSessionId: "",
      },
    });
  });
});
