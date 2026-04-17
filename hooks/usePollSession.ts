"use client";

import { useEffect, useRef, useState } from "react";
import type { StudySessionListItem } from "@/models/StudySession";
import { toast } from "@/lib/toast";

// Backoff schedule for polling a pending session. Keeps the first tick snappy
// (sessions usually complete within a few seconds) and then slows down to
// avoid hammering MongoDB / the API while a long generation is in flight.
const POLL_BACKOFF_MS = [1500, 3000, 5000, 5000, 5000, 5000] as const;
// Stop auto-polling after this cumulative budget; the user can still click
// the "Refresh" button to continue checking manually.
const POLL_BUDGET_MS = 30_000;

export function usePollSession(initial: StudySessionListItem) {
  const [session, setSession] = useState<StudySessionListItem>(initial);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExhaustedPolling, setHasExhaustedPolling] = useState(false);

  const pollStartRef = useRef<number | null>(null);
  const pollAttemptRef = useRef(0);

  const shouldPoll = session.status === "pending" && !hasExhaustedPolling;

  async function refresh(opts?: { silent?: boolean }) {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: "GET" });
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String((json as { error?: unknown }).error ?? "Request failed")
            : "Request failed";
        if (opts?.silent) {
          setError(message);
        } else {
          toast.error("Couldn’t refresh session", { description: message });
        }
        return;
      }
      const next = json as StudySessionListItem;
      setSession(next);
      if (next.status !== "pending") {
        pollStartRef.current = null;
        pollAttemptRef.current = 0;
        setHasExhaustedPolling(false);
      }
    } catch {
      if (opts?.silent) {
        setError("Failed to refresh session. Please try again.");
      } else {
        toast.error("Couldn’t refresh session", {
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!shouldPoll) return;

    if (pollStartRef.current === null) {
      pollStartRef.current = Date.now();
      pollAttemptRef.current = 0;
    }

    const elapsed = Date.now() - pollStartRef.current;
    if (elapsed >= POLL_BUDGET_MS) {
      setHasExhaustedPolling(true);
      return;
    }

    const delay =
      POLL_BACKOFF_MS[
        Math.min(pollAttemptRef.current, POLL_BACKOFF_MS.length - 1)
      ]!;

    const t = window.setTimeout(() => {
      pollAttemptRef.current += 1;
      void refresh({ silent: true });
    }, delay);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPoll, session.updatedAt]);

  async function manualRefresh() {
    // Clicking Refresh manually re-enables the auto-poll budget for another
    // round so the user isn't stuck if generation is truly slow.
    pollStartRef.current = null;
    pollAttemptRef.current = 0;
    setHasExhaustedPolling(false);
    await refresh();
  }

  return {
    session,
    isRefreshing,
    error,
    setError,
    refresh: manualRefresh,
    hasExhaustedPolling,
  } as const;
}
