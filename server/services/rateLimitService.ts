import "server-only";

import {
  decrementRateLimitBucket,
  incrementRateLimitBucket,
} from "@/server/repositories/rateLimitRepository";

/**
 * Per-user quota for the AI generation endpoint. Two independent windows:
 *
 * 1. Burst window — guards against scripted spamming within a short time.
 * 2. Daily window — caps total paid Gemini calls per user per day.
 *
 * Both windows are MongoDB-backed so that limits persist across serverless
 * cold starts and horizontally-scaled instances. TTL indexes auto-delete old
 * buckets; we never leave dead state behind.
 */

const GENERATE_BURST_SCOPE = "generate:burst" as const;
const GENERATE_DAILY_SCOPE = "generate:day" as const;

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getConfig() {
  return {
    burstLimit: num("GENERATE_BURST_LIMIT", 5),
    burstWindowSeconds: num("GENERATE_BURST_WINDOW_SECONDS", 60),
    dailyLimit: num("GENERATE_DAILY_LIMIT", 30),
  } as const;
}

function currentBurstWindow(windowSeconds: number): {
  windowId: string;
  expireAt: Date;
} {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expireAt = new Date(windowStart + windowMs);
  return { windowId: String(windowStart), expireAt };
}

function currentDailyWindow(): { windowId: string; expireAt: Date } {
  // UTC day boundary. Keeps accounting stable regardless of the user's TZ.
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const windowId = `${y}-${m}-${d}`;

  const expireAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return { windowId, expireAt };
}

export type RateLimitDecision =
  | { allowed: true; remainingBurst: number; remainingDaily: number }
  | {
      allowed: false;
      reason: "BURST" | "DAILY";
      retryAfterSeconds: number;
      limit: number;
    };

/**
 * Atomically record an attempted generation. Returns `allowed: false` with a
 * retry hint if either the burst or the daily quota is now exhausted.
 *
 * On rejection, the bucket that triggered the rejection is NOT refunded —
 * consuming an over-limit slot is itself a signal we want to rate-limit.
 * The OTHER bucket, however, is refunded so a daily-limit hit doesn't also
 * burn the burst slot (and vice versa).
 */
export async function consumeGenerateQuota(input: {
  userId: string;
}): Promise<RateLimitDecision> {
  const cfg = getConfig();
  const burst = currentBurstWindow(cfg.burstWindowSeconds);
  const daily = currentDailyWindow();

  const burstResult = await incrementRateLimitBucket({
    scope: GENERATE_BURST_SCOPE,
    userId: input.userId,
    windowId: burst.windowId,
    expireAt: burst.expireAt,
  });

  if (burstResult.count > cfg.burstLimit) {
    // Over the burst limit — no need to touch the daily bucket.
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((burst.expireAt.getTime() - Date.now()) / 1000),
    );
    return {
      allowed: false,
      reason: "BURST",
      retryAfterSeconds,
      limit: cfg.burstLimit,
    };
  }

  const dailyResult = await incrementRateLimitBucket({
    scope: GENERATE_DAILY_SCOPE,
    userId: input.userId,
    windowId: daily.windowId,
    expireAt: daily.expireAt,
  });

  if (dailyResult.count > cfg.dailyLimit) {
    // Refund the burst slot — daily is the real limiter here.
    await decrementRateLimitBucket({
      scope: GENERATE_BURST_SCOPE,
      userId: input.userId,
      windowId: burst.windowId,
    });

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((daily.expireAt.getTime() - Date.now()) / 1000),
    );
    return {
      allowed: false,
      reason: "DAILY",
      retryAfterSeconds,
      limit: cfg.dailyLimit,
    };
  }

  return {
    allowed: true,
    remainingBurst: Math.max(0, cfg.burstLimit - burstResult.count),
    remainingDaily: Math.max(0, cfg.dailyLimit - dailyResult.count),
  };
}

/**
 * Refund a slot from BOTH buckets. Call this when a generation request
 * short-circuits (idempotency hit, content-hash cache hit, validation error
 * that happens after consumeGenerateQuota) so the user isn't penalized for
 * a free reuse.
 */
export async function refundGenerateQuota(input: {
  userId: string;
}): Promise<void> {
  const cfg = getConfig();
  const burst = currentBurstWindow(cfg.burstWindowSeconds);
  const daily = currentDailyWindow();

  await Promise.all([
    decrementRateLimitBucket({
      scope: GENERATE_BURST_SCOPE,
      userId: input.userId,
      windowId: burst.windowId,
    }),
    decrementRateLimitBucket({
      scope: GENERATE_DAILY_SCOPE,
      userId: input.userId,
      windowId: daily.windowId,
    }),
  ]);
}
