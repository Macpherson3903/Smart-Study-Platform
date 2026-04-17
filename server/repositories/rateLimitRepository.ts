import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/lib/mongodb";

export const RATE_LIMIT_COLLECTION = "rateLimitBuckets" as const;

export interface RateLimitBucketDocument extends Document {
  /** Composite key: `${scope}:${userId}:${windowId}` */
  _id: string;
  scope: string;
  userId: string;
  windowId: string;
  count: number;
  /** TTL anchor; Mongo drops this doc once `expireAt` is in the past. */
  expireAt: Date;
}

async function getCollection(): Promise<Collection<RateLimitBucketDocument>> {
  const db = await getDb();
  return db.collection<RateLimitBucketDocument>(RATE_LIMIT_COLLECTION);
}

let indexesEnsured = false;

export async function ensureRateLimitIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getCollection();
  // TTL: Mongo auto-deletes once expireAt is in the past.
  await col.createIndex(
    { expireAt: 1 },
    { expireAfterSeconds: 0, name: "rateLimitBuckets_ttl" },
  );
  indexesEnsured = true;
}

/**
 * Atomically increment a per-user counter for `scope` inside the time window
 * identified by `windowId`. Returns the new count and the bucket's expiry.
 *
 * Uses `findOneAndUpdate` with `upsert: true` so concurrent requests are
 * linearized by MongoDB — no race, no double-counting.
 */
export async function incrementRateLimitBucket(input: {
  scope: string;
  userId: string;
  windowId: string;
  expireAt: Date;
}): Promise<{ count: number; expireAt: Date }> {
  await ensureRateLimitIndexes();
  const col = await getCollection();

  const id = `${input.scope}:${input.userId}:${input.windowId}`;

  const res = await col.findOneAndUpdate(
    { _id: id },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        scope: input.scope,
        userId: input.userId,
        windowId: input.windowId,
        expireAt: input.expireAt,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  if (!res) {
    // `returnDocument: "after"` with upsert should always return a doc; this
    // branch is a type-narrowing safety net.
    return { count: 1, expireAt: input.expireAt };
  }

  return { count: res.count, expireAt: res.expireAt };
}

/**
 * Decrement a bucket (used to "refund" a slot when the caller later decides
 * the request didn't actually consume quota, e.g. a content-hash cache hit).
 * Never drops below zero.
 */
export async function decrementRateLimitBucket(input: {
  scope: string;
  userId: string;
  windowId: string;
}): Promise<void> {
  const col = await getCollection();
  const id = `${input.scope}:${input.userId}:${input.windowId}`;
  await col.updateOne({ _id: id, count: { $gt: 0 } }, { $inc: { count: -1 } });
}
