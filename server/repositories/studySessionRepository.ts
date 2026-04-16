import "server-only";

import { ObjectId, type Collection } from "mongodb";

import {
  STUDY_CONTENT_KIND,
  STUDY_CONTENT_PROMPT_VERSION,
  type StudyContent,
} from "@/lib/ai/studyContentSchema";
import { getDb } from "@/lib/mongodb";
import {
  STUDY_SESSIONS_COLLECTION,
  type InsertPendingStudySessionInput,
  type StudySessionAiMeta,
  type StudySessionDocument,
  type StudySessionError,
  type StudySessionStatus,
} from "@/models/StudySession";

async function getCollection(): Promise<Collection<StudySessionDocument>> {
  const db = await getDb();
  return db.collection<StudySessionDocument>(STUDY_SESSIONS_COLLECTION);
}

export async function ensureStudySessionIndexes(): Promise<void> {
  const col = await getCollection();

  // User-scoped listing + cursor pagination.
  await col.createIndex({ userId: 1, createdAt: -1, _id: -1 });

  // Idempotency: unique per user, optional key.
  await col.createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      partialFilterExpression: { idempotencyKey: { $exists: true } },
    },
  );
}

export async function insertPendingStudySession(
  input: InsertPendingStudySessionInput,
): Promise<StudySessionDocument & { _id: ObjectId }> {
  const col = await getCollection();
  const now = new Date();

  const base: StudySessionDocument = {
    userId: input.userId,
    inputText: input.inputText,
    aiMeta: input.aiMeta,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const doc: StudySessionDocument = {
    ...base,
    ...(typeof input.inputTextPreview === "string"
      ? { inputTextPreview: input.inputTextPreview }
      : {}),
    ...(typeof input.idempotencyKey === "string"
      ? { idempotencyKey: input.idempotencyKey }
      : {}),
  };

  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function findStudySessionByIdempotencyKey(input: {
  userId: string;
  idempotencyKey: string;
}): Promise<(StudySessionDocument & { _id: ObjectId }) | null> {
  const col = await getCollection();
  return await col.findOne({
    userId: input.userId,
    idempotencyKey: input.idempotencyKey,
  });
}

export async function findStudySessionById(input: {
  userId: string;
  id: ObjectId;
}): Promise<(StudySessionDocument & { _id: ObjectId }) | null> {
  const col = await getCollection();
  return await col.findOne({ _id: input.id, userId: input.userId });
}

export async function updateStudySessionToCompleteByIdIfStatus(input: {
  userId: string;
  id: ObjectId;
  fromStatus: StudySessionStatus;
  result: StudyContent;
}): Promise<boolean> {
  const col = await getCollection();
  const now = new Date();

  const res = await col.updateOne(
    { _id: input.id, userId: input.userId, status: input.fromStatus },
    {
      $set: {
        status: "complete",
        result: input.result,
        updatedAt: now,
      },
      $unset: { error: "" },
    },
  );

  return res.modifiedCount > 0;
}

export async function updateStudySessionToErrorByIdIfStatus(input: {
  userId: string;
  id: ObjectId;
  fromStatus: StudySessionStatus;
  error: StudySessionError;
}): Promise<boolean> {
  const col = await getCollection();
  const now = new Date();

  const res = await col.updateOne(
    { _id: input.id, userId: input.userId, status: input.fromStatus },
    {
      $set: {
        status: "error",
        error: input.error,
        updatedAt: now,
      },
      $unset: { result: "" },
    },
  );

  return res.modifiedCount > 0;
}

export type StudySessionCursor = { createdAt: Date; id: ObjectId };

export async function findStudySessionsByUserIdPaginated(input: {
  userId: string;
  limit: number;
  cursor?: StudySessionCursor;
}): Promise<{
  sessions: Array<StudySessionDocument & { _id: ObjectId }>;
  hasMore: boolean;
  nextCursor?: StudySessionCursor;
}> {
  const col = await getCollection();

  const filter: Record<string, unknown> = { userId: input.userId };

  if (input.cursor) {
    filter["$or"] = [
      { createdAt: { $lt: input.cursor.createdAt } },
      { createdAt: input.cursor.createdAt, _id: { $lt: input.cursor.id } },
    ];
  }

  const docs = await col
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(input.limit + 1)
    .toArray();

  const hasMore = docs.length > input.limit;
  const page = hasMore ? docs.slice(0, input.limit) : docs;

  const last = page.at(-1);
  const nextCursor = last ? { createdAt: last.createdAt, id: last._id } : undefined;

  return { sessions: page, hasMore, nextCursor };
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

export function buildAiMeta(input: {
  model: string;
  options: StudySessionAiMeta["options"];
}): StudySessionAiMeta {
  return {
    kind: STUDY_CONTENT_KIND,
    promptVersion: STUDY_CONTENT_PROMPT_VERSION,
    model: input.model,
    options: input.options,
  };
}

