import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  acknowledgeSupportPrompt,
  evaluateSupportPrompt,
} from "@/server/services/supportPromptService";
import * as studySessionService from "@/server/services/studySessionService";
import * as userPreferencesService from "@/server/services/userPreferencesService";

vi.mock("@/server/services/studySessionService");
vi.mock("@/server/services/userPreferencesService");

describe("supportPromptService", () => {
  const mockGetUserPreferences = vi.mocked(
    userPreferencesService.getUserPreferences,
  );
  const mockUpdateUserPreferences = vi.mocked(
    userPreferencesService.updateUserPreferences,
  );
  const mockCountCompletedStudySessions = vi.mocked(
    studySessionService.countCompletedStudySessions,
  );

  beforeEach(() => {
    vi.resetAllMocks();
    mockCountCompletedStudySessions.mockResolvedValue(0);
    mockGetUserPreferences.mockResolvedValue({
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
    });
  });

  it("shows for a new auth session", async () => {
    const result = await evaluateSupportPrompt({
      userId: "user_1",
      authSessionId: "sess_123",
    });

    expect(result.shouldShow).toBe(true);
    expect(result.reason).toBe("auth");
  });

  it("shows every 2 completed sessions", async () => {
    mockCountCompletedStudySessions.mockResolvedValue(2);

    const result = await evaluateSupportPrompt({ userId: "user_1" });

    expect(result.shouldShow).toBe(true);
    expect(result.reason).toBe("every_2_sessions");
  });

  it("does not repeat prompt for same completed count", async () => {
    mockCountCompletedStudySessions.mockResolvedValue(2);
    mockGetUserPreferences.mockResolvedValue({
      defaultGenerateOptions: {
        summary: true,
        questions: true,
        flashcards: true,
      },
      autoFocusStudyInput: true,
      supportPrompt: {
        lastShownAt: null,
        lastPromptedCompletedCount: 2,
        lastPromptedAuthSessionId: "",
      },
    });

    const result = await evaluateSupportPrompt({ userId: "user_1" });
    expect(result.shouldShow).toBe(false);
  });

  it("respects cooldown", async () => {
    mockCountCompletedStudySessions.mockResolvedValue(4);
    mockGetUserPreferences.mockResolvedValue({
      defaultGenerateOptions: {
        summary: true,
        questions: true,
        flashcards: true,
      },
      autoFocusStudyInput: true,
      supportPrompt: {
        lastShownAt: new Date().toISOString(),
        lastPromptedCompletedCount: 2,
        lastPromptedAuthSessionId: "",
      },
    });

    const result = await evaluateSupportPrompt({ userId: "user_1" });
    expect(result.shouldShow).toBe(false);
  });

  it("acknowledges auth prompts with auth session id", async () => {
    await acknowledgeSupportPrompt({
      userId: "user_1",
      reason: "auth",
      authSessionId: "sess_abc",
      completedCount: 2,
    });

    expect(mockUpdateUserPreferences).toHaveBeenCalledWith({
      userId: "user_1",
      patch: {
        supportPrompt: expect.objectContaining({
          lastPromptedAuthSessionId: "sess_abc",
        }),
      },
    });
  });
});
