import type { Document } from "mongodb";

import type { UserPreferences } from "@/lib/userPreferences";

export const USER_PREFERENCES_COLLECTION = "userPreferences" as const;

export interface UserPreferencesDocument extends Document {
  userId: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
