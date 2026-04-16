"use client";

import { useEffect, useState } from "react";

import type { StudyContent } from "@/lib/ai/studyContentSchema";
import type { StudySessionListItem } from "@/models/StudySession";

import { ResultsTabs } from "@/components/features/results/ResultsTabs";
import { GenerationLoadingPanel } from "@/components/features/generation/GenerationLoadingPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { SessionStatusBadge } from "@/components/features/sessions/SessionStatusBadge";

export function SessionResults(props: { initial: StudySessionListItem }) {
  const [session, setSession] = useState<StudySessionListItem>(props.initial);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldPoll = session.status === "pending";

  async function refresh() {
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
        setError(message);
        return;
      }
      setSession(json as StudySessionListItem);
    } catch {
      setError("Failed to refresh session. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!shouldPoll) return;
    const t = window.setTimeout(() => {
      void refresh();
    }, 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPoll, session.updatedAt]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="truncate text-pretty text-xl font-semibold tracking-tight text-slate-900">
              Session
            </h2>
            <SessionStatusBadge status={session.status} />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {session.inputTextPreview}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          isLoading={isRefreshing}
          onClick={() => void refresh()}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      {session.status === "pending" ? (
        <GenerationLoadingPanel label="Still generating… this can take a moment." />
      ) : null}

      {session.status === "error" ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm font-semibold text-red-800">Generation failed</p>
            <p className="mt-1 text-sm text-red-700">
              {session.error?.message ?? "This session failed to generate."}
            </p>
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/sessions/new")}
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {session.status === "complete" && session.result ? (
        <ResultsTabs content={session.result as StudyContent} />
      ) : null}
    </div>
  );
}

