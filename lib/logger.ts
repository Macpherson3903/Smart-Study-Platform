/**
 * Tiny structured logger. Emits single-line JSON to stdout in production and
 * pretty text in development, so logs are grep-able in Vercel / Datadog but
 * still readable locally.
 *
 * Deliberately a zero-dependency wrapper around `console.*` — swap to pino or
 * a drain (Datadog, Axiom, Better Stack) later by re-implementing this file.
 * Product code should import from `@/lib/logger` only.
 */

type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

function emit(level: Level, message: string, fields?: Fields): void {
  const payload = {
    level,
    ts: new Date().toISOString(),
    msg: message,
    ...(fields ?? {}),
  };

  if (isProd) {
    const fn =
      level === "error"
        ? console.error
        : level === "warn"
          ? console.warn
          : console.log;
    fn(JSON.stringify(payload));
    return;
  }

  const fields_ = fields
    ? " " +
      Object.entries(fields)
        .map(([k, v]) => `${k}=${safe(v)}`)
        .join(" ")
    : "";
  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : console.log;
  fn(`[${level.toUpperCase()}] ${message}${fields_}`);
}

function safe(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export const logger = {
  debug: (message: string, fields?: Fields) => emit("debug", message, fields),
  info: (message: string, fields?: Fields) => emit("info", message, fields),
  warn: (message: string, fields?: Fields) => emit("warn", message, fields),
  error: (message: string, fields?: Fields) => emit("error", message, fields),
  /**
   * Log a caught error with optional extra context. Always emits at "error"
   * level, records the `digest` when present (Next.js attaches one when an
   * error reaches a boundary).
   */
  exception: (err: unknown, fields?: Fields) => {
    const base: Fields = { ...(fields ?? {}) };
    if (err instanceof Error) {
      base.error = err.message;
      base.errorName = err.name;
      if (err.stack) base.stack = err.stack.split("\n").slice(0, 8).join(" | ");
      const digest = (err as { digest?: string }).digest;
      if (digest) base.digest = digest;
    } else {
      base.error = safe(err);
    }
    emit("error", base.error as string, base);
  },
} as const;
