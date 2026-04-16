import "server-only";

import { ObjectId } from "mongodb";
import { z } from "zod";

import type { StudySessionListItem } from "@/models/StudySession";
import {
  ensureStudySessionIndexes,
  findStudySessionById,
  findStudySessionsByUserIdPaginated,
  toObjectId,
  type StudySessionCursor,
} from "@/server/repositories/studySessionRepository";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const INPUT_TEXT_PREVIEW_CHARS = 400;

const cursorPayloadSchema = z
  .object({
    createdAt: z.string(),
    id: z.string(),
  })
  .strict();

function encodeCursor(cursor: StudySessionCursor): string {
  const payload = {
    createdAt: cursor.createdAt.toISOString(),
    id: cursor.id.toString(),
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(encoded: string): StudySessionCursor {
  let parsed: unknown;
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid cursor");
  }

  const validated = cursorPayloadSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Invalid cursor");
  }

  const createdAt = new Date(validated.data.createdAt);
  if (!Number.isFinite(createdAt.getTime())) {
    throw new Error("Invalid cursor");
  }

  const { id } = validated.data;
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid cursor");
  }

  return { createdAt, id: new ObjectId(id) };
}

export async function listStudySessions(input: {
  userId: string;
  limit?: number;
  cursor?: string;
  includeResult?: boolean;
}): Promise<{
  sessions: StudySessionListItem[];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}> {
  await ensureStudySessionIndexes();

  const limitRaw = input.limit ?? DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, limitRaw), MAX_LIMIT);

  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;

  const page = await findStudySessionsByUserIdPaginated({
    userId: input.userId,
    limit,
    cursor,
  });

  const sessions: StudySessionListItem[] = page.sessions.map((s) => ({
    id: s._id.toString(),
    inputTextPreview: (s.inputTextPreview ?? s.inputText).slice(
      0,
      INPUT_TEXT_PREVIEW_CHARS,
    ),
    status: s.status,
    result:
      input.includeResult === false
        ? undefined
        : s.status === "complete" && "result" in s
          ? s.result
          : undefined,
    error: s.status === "error" && "error" in s ? s.error : undefined,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return {
    sessions,
    pageInfo: {
      hasMore: page.hasMore,
      nextCursor: page.hasMore && page.nextCursor ? encodeCursor(page.nextCursor) : undefined,
    },
  };
}

export async function getStudySessionById(input: {
  userId: string;
  id: string;
  includeResult?: boolean;
}): Promise<StudySessionListItem | null> {
  await ensureStudySessionIndexes();

  if (!ObjectId.isValid(input.id)) return null;

  const doc = await findStudySessionById({
    userId: input.userId,
    id: toObjectId(input.id),
  });

  if (!doc) return null;

  const item: StudySessionListItem = {
    id: doc._id.toString(),
    inputTextPreview: (doc.inputTextPreview ?? doc.inputText).slice(
      0,
      INPUT_TEXT_PREVIEW_CHARS,
    ),
    status: doc.status,
    result:
      input.includeResult === false
        ? undefined
        : doc.status === "complete" && "result" in doc
          ? doc.result
          : undefined,
    error: doc.status === "error" && "error" in doc ? doc.error : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };

  return item;
}

