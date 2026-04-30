import "server-only";

import { type Collection } from "mongodb";

import type { UserPreferences } from "@/lib/userPreferences";
import { getDb } from "@/lib/mongodb";
import {
  USER_PREFERENCES_COLLECTION,
  type UserPreferencesDocument,
} from "@/models/UserPreferences";

async function getCollection(): Promise<Collection<UserPreferencesDocument>> {
  const db = await getDb();
  return db.collection<UserPreferencesDocument>(USER_PREFERENCES_COLLECTION);
}

export async function ensureUserPreferencesIndexes(): Promise<void> {
  const col = await getCollection();
  await col.createIndex({ userId: 1 }, { unique: true });
}

export async function findUserPreferencesByUserId(
  userId: string,
): Promise<UserPreferencesDocument | null> {
  const col = await getCollection();
  return await col.findOne({ userId });
}

export async function upsertUserPreferencesByUserId(input: {
  userId: string;
  preferences: UserPreferences;
}): Promise<void> {
  const col = await getCollection();
  const now = new Date();

  await col.updateOne(
    { userId: input.userId },
    {
      $set: {
        preferences: input.preferences,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: input.userId,
        createdAt: now,
      },
    },
    { upsert: true },
  );
}
