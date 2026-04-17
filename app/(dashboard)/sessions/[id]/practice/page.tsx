import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PracticeMode } from "@/components/features/practice/PracticeMode";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserIdOrThrow } from "@/lib/auth";
import { getStudySessionById } from "@/server/services/studySessionService";
import type { StudyContent, StudyQuestion } from "@/lib/ai/studyContentSchema";

export const metadata: Metadata = { title: "Practice Mode" };

export default async function SessionPracticePage(props: {
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

  const questions: StudyQuestion[] =
    session.status === "complete" && session.result
      ? (session.result as StudyContent).questions
      : [];

  const hasAnswers = questions.some((q) => q.answer.length > 0);

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
          Practice Mode
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Answer each question and get AI-powered feedback on your response.
        </p>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          title="No questions available"
          description="This session was not generated with questions. Create a new session with questions enabled."
          action={{ label: "New session", href: "/sessions/new" }}
        />
      ) : !hasAnswers ? (
        <EmptyState
          title="Practice mode unavailable"
          description="This session was created with an older format that doesn't include reference answers. Create a new session to use practice mode."
          action={{ label: "New session", href: "/sessions/new" }}
        />
      ) : (
        <PracticeMode sessionId={id} questions={questions} />
      )}
    </div>
  );
}
