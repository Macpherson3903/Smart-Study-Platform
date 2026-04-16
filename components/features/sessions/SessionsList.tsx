"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { StudySessionListItem } from "@/models/StudySession";

import { SessionStatusBadge } from "@/components/features/sessions/SessionStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type PageInfo = { hasMore: boolean; nextCursor?: string };

export function SessionsList(props: {
  initialSessions: StudySessionListItem[];
  initialPageInfo: PageInfo;
}) {
  const [sessions, setSessions] = useState<StudySessionListItem[]>(
    props.initialSessions,
  );
  const [pageInfo, setPageInfo] = useState<PageInfo>(props.initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = pageInfo.hasMore && typeof pageInfo.nextCursor === "string";

  const loadMoreHref = useMemo(() => {
    if (!canLoadMore) return null;
    const params = new URLSearchParams();
    params.set("limit", "20");
    params.set("includeResult", "0");
    params.set("cursor", pageInfo.nextCursor as string);
    return `/api/sessions?${params.toString()}`;
  }, [canLoadMore, pageInfo.nextCursor]);

  async function onLoadMore() {
    if (!loadMoreHref || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(loadMoreHref, { method: "GET" });
      const json = (await res.json()) as unknown;

      if (!res.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String((json as { error?: unknown }).error ?? "Request failed")
            : "Request failed";
        setError(message);
        return;
      }

      const data = json as { sessions: StudySessionListItem[]; pageInfo: PageInfo };
      setSessions((prev) => [...prev, ...data.sessions]);
      setPageInfo(data.pageInfo);
    } catch {
      setError("Failed to load more sessions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No sessions yet"
        description="Create your first session to generate summaries, flashcards, and questions."
        action={{ label: "Create session", href: "/sessions/new" }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-slate-200">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  className="flex items-start justify-between gap-4 p-4 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/25"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {truncate(s.inputTextPreview, 140)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatIsoDate(s.createdAt)}
                    </p>
                  </div>
                  <div className="flex-none">
                    <SessionStatusBadge status={s.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm font-medium text-red-700">{error}</p>
      ) : null}

      {canLoadMore ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            isLoading={isLoading}
            onClick={onLoadMore}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function formatIsoDate(iso: string) {
  return iso.slice(0, 10);
}

function truncate(text: string, maxChars: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars - 1)}…`
    : normalized;
}

