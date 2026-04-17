"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { StudyContent } from "@/lib/ai/studyContentSchema";
import type { StudySessionListItem } from "@/models/StudySession";
import { toast } from "@/lib/toast";
import { usePollSession } from "@/hooks/usePollSession";

import { ResultsTabs } from "@/components/features/results/ResultsTabs";
import { GenerationLoadingPanel } from "@/components/features/generation/GenerationLoadingPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SessionStatusBadge } from "@/components/features/sessions/SessionStatusBadge";

export function SessionResults(props: { initial: StudySessionListItem }) {
  const router = useRouter();
  const { session, isRefreshing, error, setError, refresh } = usePollSession(
    props.initial,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const content =
    session.status === "complete" && session.result
      ? (session.result as StudyContent)
      : null;
  const hasFlashcards = content ? content.flashcards.length > 0 : false;
  const hasQuestions = content ? content.questions.length > 0 : false;

  async function deleteSession() {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        toast.success("Session deleted");
        router.push("/sessions");
        return;
      }
      toast.error("Failed to delete session", {
        action: { label: "Retry", onClick: () => void deleteSession() },
      });
    } catch {
      toast.error("Failed to delete session", {
        description: "Please check your connection and try again.",
        action: { label: "Retry", onClick: () => void deleteSession() },
      });
    } finally {
      setIsDeleting(false);
    }
  }

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

        <div className="flex flex-wrap gap-2">
          {hasFlashcards && (
            <ButtonLink
              href={`/sessions/${session.id}/flashcards`}
              variant="secondary"
              size="sm"
            >
              <FlashcardIcon />
              Study Flashcards
            </ButtonLink>
          )}
          {hasQuestions && (
            <ButtonLink
              href={`/sessions/${session.id}/practice`}
              variant="secondary"
              size="sm"
            >
              <PracticeIcon />
              Practice Mode
            </ButtonLink>
          )}
          <Button
            variant="secondary"
            size="sm"
            isLoading={isRefreshing}
            onClick={() => void refresh()}
          >
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={isDeleting}
            onClick={() => void deleteSession()}
          >
            Delete
          </Button>
        </div>
      </div>

      {error ? (
        <Alert
          tone="error"
          title="Something went wrong"
          description={error}
          action={{ label: "Dismiss", onClick: () => setError(null) }}
        />
      ) : null}

      {session.status === "pending" ? (
        <>
          <GenerationLoadingPanel label="Still generating… this can take a moment." />
          <ResultsTabsSkeleton />
        </>
      ) : null}

      {session.status === "error" ? (
        <Alert
          tone="error"
          title="Generation failed"
          description={
            session.error?.message ?? "This session failed to generate."
          }
          action={{
            label: "Retry with same text",
            onClick: () => {
              if (session.inputText) {
                sessionStorage.setItem("retry-input-text", session.inputText);
              }
              router.push("/sessions/new?retry=1");
            },
          }}
        />
      ) : null}

      {content ? <ResultsTabs content={content} /> : null}
    </div>
  );
}

function ResultsTabsSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="py-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-10/12" />
          <Skeleton className="h-3 w-9/12" />
          <Skeleton className="h-3 w-8/12" />
        </div>
      </CardContent>
    </Card>
  );
}

function FlashcardIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Z" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
