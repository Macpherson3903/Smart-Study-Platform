import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

// Never cache health checks. Stale 200s are dangerous — load balancers may
// route traffic to an unhealthy instance.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type CheckResult =
  | { name: string; ok: true; latencyMs: number }
  | { name: string; ok: false; latencyMs: number; error: string };

async function timed<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<CheckResult> {
  const start = Date.now();
  try {
    await fn();
    return { name, ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}

export async function GET() {
  const checks = await Promise.all([
    timed("mongodb", async () => {
      const db = await getDb();
      const res = await db.command({ ping: 1 });
      if (res.ok !== 1) throw new Error("Mongo ping did not return ok:1");
    }),
    timed("gemini-config", async () => {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
      }
    }),
    timed("clerk-config", async () => {
      if (
        !process.env.CLERK_SECRET_KEY ||
        !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      ) {
        throw new Error("Clerk keys are not set");
      }
    }),
  ]);

  const ok = checks.every((c) => c.ok);

  return NextResponse.json(
    {
      ok,
      ts: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
