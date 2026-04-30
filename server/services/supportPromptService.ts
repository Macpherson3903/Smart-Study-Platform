import "server-only";

import { countCompletedStudySessions } from "@/server/services/studySessionService";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/server/services/userPreferencesService";

const SUPPORT_PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DONATION_URL = "https://flutterwave.com";

export type SupportPromptReason = "auth" | "every_2_sessions";

export async function evaluateSupportPrompt(input: {
  userId: string;
  authSessionId?: string;
}): Promise<{
  shouldShow: boolean;
  reason?: SupportPromptReason;
  checkoutUrl: string;
  completedCount: number;
}> {
  const [preferences, completedCount] = await Promise.all([
    getUserPreferences({ userId: input.userId }),
    countCompletedStudySessions({ userId: input.userId }),
  ]);

  const state = preferences.supportPrompt;
  const now = Date.now();
  const lastShownAtMs = state.lastShownAt
    ? new Date(state.lastShownAt).getTime()
    : null;
  const hasCooldown =
    typeof lastShownAtMs === "number" &&
    Number.isFinite(lastShownAtMs) &&
    now - lastShownAtMs < SUPPORT_PROMPT_COOLDOWN_MS;

  const hasNewAuthSession =
    typeof input.authSessionId === "string" &&
    input.authSessionId.length > 0 &&
    input.authSessionId !== state.lastPromptedAuthSessionId;

  const shouldShowForCompletedSessions =
    completedCount > 0 &&
    completedCount % 2 === 0 &&
    completedCount > state.lastPromptedCompletedCount;

  let reason: SupportPromptReason | undefined;
  if (hasNewAuthSession) {
    reason = "auth";
  } else if (shouldShowForCompletedSessions) {
    reason = "every_2_sessions";
  }

  if (!reason) {
    return {
      shouldShow: false,
      checkoutUrl: getCheckoutUrl(),
      completedCount,
    };
  }

  const isFirstAuthPrompt = reason === "auth" && state.lastShownAt === null;
  if (hasCooldown && !isFirstAuthPrompt) {
    return {
      shouldShow: false,
      checkoutUrl: getCheckoutUrl(),
      completedCount,
    };
  }

  return {
    shouldShow: true,
    reason,
    checkoutUrl: getCheckoutUrl(),
    completedCount,
  };
}

export async function acknowledgeSupportPrompt(input: {
  userId: string;
  reason: SupportPromptReason;
  authSessionId?: string;
  completedCount: number;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const preferences = await getUserPreferences({ userId: input.userId });
  const supportPrompt = {
    ...preferences.supportPrompt,
    lastShownAt: nowIso,
  };

  if (input.reason === "every_2_sessions") {
    supportPrompt.lastPromptedCompletedCount = input.completedCount;
  }
  if (input.reason === "auth" && input.authSessionId) {
    supportPrompt.lastPromptedAuthSessionId = input.authSessionId;
  }

  await updateUserPreferences({
    userId: input.userId,
    patch: {
      supportPrompt,
    },
  });
}

function getCheckoutUrl(): string {
  return (
    process.env.NEXT_PUBLIC_FLUTTERWAVE_DONATION_URL ?? DEFAULT_DONATION_URL
  );
}
