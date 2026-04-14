import "server-only";

import { ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import {
  USER_SESSIONS_COLLECTION,
  type CreateUserSessionInput,
  type GeneratedResult,
  type UserSessionDocument,
} from "@/models/UserSession";

async function getCollection(): Promise<Collection<UserSessionDocument>> {
  const db = await getDb();
  return db.collection<UserSessionDocument>(USER_SESSIONS_COLLECTION);
}

export async function ensureUserSessionIndexes(): Promise<void> {
  const col = await getCollection();
  await col.createIndex({ userId: 1, createdAt: -1 });
  await col.createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      partialFilterExpression: { idempotencyKey: { $exists: true } },
    },
  );
}

export async function insertUserSession(
  input: CreateUserSessionInput,
): Promise<UserSessionDocument & { _id: ObjectId }> {
  const col = await getCollection();
  const now = new Date();

  const doc: UserSessionDocument = {
    userId: input.userId,
    inputText: input.inputText,
    idempotencyKey: input.idempotencyKey,
    generatedResult: input.generatedResult,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function findUserSessionByIdempotencyKey(input: {
  userId: string;
  idempotencyKey: string;
}): Promise<(UserSessionDocument & { _id: ObjectId }) | null> {
  const col = await getCollection();
  return await col.findOne({
    userId: input.userId,
    idempotencyKey: input.idempotencyKey,
  });
}

export async function findUserSessionsByUserId(
  userId: string,
  limit = 20,
): Promise<Array<UserSessionDocument & { _id: ObjectId }>> {
  const col = await getCollection();
  return await col
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function updateUserSessionGeneratedResultById(input: {
  id: ObjectId;
  generatedResult: GeneratedResult;
}): Promise<void> {
  const col = await getCollection();
  const now = new Date();
  await col.updateOne(
    { _id: input.id },
    { $set: { generatedResult: input.generatedResult, updatedAt: now } },
  );
}

export async function updateUserSessionGeneratedResultByIdIfStatus(input: {
  id: ObjectId;
  fromStatus: string;
  generatedResult: GeneratedResult;
}): Promise<boolean> {
  const col = await getCollection();
  const now = new Date();
  const result = await col.updateOne(
    { _id: input.id, "generatedResult.status": input.fromStatus },
    { $set: { generatedResult: input.generatedResult, updatedAt: now } },
  );
  return result.modifiedCount > 0;
}
