import "server-only";

import type { ObjectId } from "mongodb";
import type { GeneratedResult } from "@/models/UserSession";
import {
  ensureUserSessionIndexes,
  findUserSessionsByUserId,
  insertUserSession,
} from "@/server/repositories/userSessionRepository";

export async function createUserSession(input: {
  userId: string;
  inputText: string;
  generatedResult: GeneratedResult;
}): Promise<{ id: string }> {
  await ensureUserSessionIndexes();

  const created = await insertUserSession({
    userId: input.userId,
    inputText: input.inputText,
    generatedResult: input.generatedResult,
  });

  return { id: created._id.toString() };
}

export async function listUserSessions(input: {
  userId: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    inputText: string;
    generatedResult: GeneratedResult;
    createdAt: string;
    updatedAt: string;
  }>
> {
  await ensureUserSessionIndexes();

  const sessions = await findUserSessionsByUserId(input.userId, input.limit);
  return sessions.map((s) => ({
    id: (s._id as ObjectId).toString(),
    inputText: s.inputText,
    generatedResult: s.generatedResult,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}
