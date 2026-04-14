import type { Document } from "mongodb";

export const USER_SESSIONS_COLLECTION = "userSessions" as const;

export type GeneratedResult = Record<string, unknown>;

export interface UserSessionDocument extends Document {
  userId: string;
  inputText: string;
  idempotencyKey?: string;
  generatedResult: GeneratedResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserSessionInput {
  userId: string;
  inputText: string;
  idempotencyKey?: string;
  generatedResult: GeneratedResult;
}
