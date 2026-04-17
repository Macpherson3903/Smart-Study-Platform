import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FlashcardViewer } from "@/components/features/flashcards/FlashcardViewer";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserIdOrThrow } from "@/lib/auth";
import { getStudySessionById } from "@/server/services/studySessionService";
import type { StudyContent } from "@/lib/ai/studyContentSchema";

export const metadata: Metadata = { title: "Flashcards" };

export default async function SessionFlashcardsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getUserIdOrThrow();
  const { id } = await props.params;

  const session = await getStudySessionById({
    userId,
    id,
    includeResult: true,
  });

  if (!session) notFound();

  const flashcards =
    session.status === "complete" && session.result
      ? (session.result as StudyContent).flashcards
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/sessions/${id}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          &larr; Back to session
        </Link>
      </div>

      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-slate-900">
          Study Flashcards
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Click a card to flip it. Mark cards as known or review later.
        </p>
      </div>

      {flashcards.length === 0 ? (
        <EmptyState
          title="No flashcards available"
          description="This session was not generated with flashcards. Create a new session with flashcards enabled."
          action={{ label: "New session", href: "/sessions/new" }}
        />
      ) : (
        <FlashcardViewer sessionId={id} flashcards={flashcards} />
      )}
    </div>
  );
}
