"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { StudySessionListItem } from "@/models/StudySession";

import { SessionStatusBadge } from "@/components/features/sessions/SessionStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/lib/toast";

type PageInfo = { hasMore: boolean; nextCursor?: string };

export function SessionsList(props: {
  initialSessions: StudySessionListItem[];
  initialPageInfo: PageInfo;
  /** Active search query, read from the URL by the server page. */
  q?: string;
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState<StudySessionListItem[]>(
    props.initialSessions,
  );
  const [pageInfo, setPageInfo] = useState<PageInfo>(props.initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);

  // Reset in-memory pagination whenever the server re-renders with a new page
  // (e.g. after the search query in the URL changed).
  useEffect(() => {
    setSessions(props.initialSessions);
    setPageInfo(props.initialPageInfo);
  }, [props.initialSessions, props.initialPageInfo]);

  const canLoadMore =
    pageInfo.hasMore && typeof pageInfo.nextCursor === "string";

  const loadMoreHref = useMemo(() => {
    if (!canLoadMore) return null;
    const params = new URLSearchParams();
    params.set("limit", "20");
    params.set("includeResult", "0");
    params.set("cursor", pageInfo.nextCursor as string);
    if (props.q) params.set("q", props.q);
    return `/api/sessions?${params.toString()}`;
  }, [canLoadMore, pageInfo.nextCursor, props.q]);

  async function onLoadMore() {
    if (!loadMoreHref || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(loadMoreHref, { method: "GET" });
      const json = (await res.json()) as unknown;

      if (!res.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String((json as { error?: unknown }).error ?? "Request failed")
            : "Request failed";
        toast.error("Couldn’t load more sessions", {
          description: message,
          action: { label: "Retry", onClick: () => void onLoadMore() },
        });
        return;
      }

      const data = json as {
        sessions: StudySessionListItem[];
        pageInfo: PageInfo;
      };
      setSessions((prev) => [...prev, ...data.sessions]);
      setPageInfo(data.pageInfo);
    } catch {
      toast.error("Couldn’t load more sessions", {
        description: "Please check your connection and try again.",
        action: { label: "Retry", onClick: () => void onLoadMore() },
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (sessions.length === 0) {
    if (props.q) {
      return (
        <EmptyState
          title={`No matches for “${props.q}”`}
          description="Try a different keyword or clear your search."
          action={{
            label: "Clear search",
            onClick: () => router.replace("/sessions", { scroll: false }),
          }}
          secondaryAction={{ label: "New session", href: "/sessions/new" }}
        />
      );
    }

    return (
      <EmptyState
        title="No study sessions yet"
        description="Paste notes or a transcript to generate a summary, flashcards, and practice questions."
        action={{ label: "Create your first session", href: "/sessions/new" }}
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
