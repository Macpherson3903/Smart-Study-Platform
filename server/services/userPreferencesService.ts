import "server-only";

import {
  mergeUserPreferences,
  type UserPreferences,
} from "@/lib/userPreferences";
import {
  ensureUserPreferencesIndexes,
  findUserPreferencesByUserId,
  upsertUserPreferencesByUserId,
} from "@/server/repositories/userPreferencesRepository";

export async function getUserPreferences(input: {
  userId: string;
}): Promise<UserPreferences> {
  await ensureUserPreferencesIndexes();
  const found = await findUserPreferencesByUserId(input.userId);
  return mergeUserPreferences(found?.preferences);
}

export async function updateUserPreferences(input: {
  userId: string;
  patch: Partial<UserPreferences>;
}): Promise<UserPreferences> {
  await ensureUserPreferencesIndexes();
  const current = await getUserPreferences({ userId: input.userId });
  const next = mergeUserPreferences({
    ...current,
    ...input.patch,
    defaultGenerateOptions: {
      ...current.defaultGenerateOptions,
      ...(input.patch.defaultGenerateOptions ?? {}),
    },
    supportPrompt: {
      ...current.supportPrompt,
      ...(input.patch.supportPrompt ?? {}),
    },
  });
  await upsertUserPreferencesByUserId({
    userId: input.userId,
    preferences: next,
  });
  return next;
}
