import { SessionsList } from "@/components/features/sessions/SessionsList";
import { getUserIdOrThrow } from "@/lib/auth";
import { listStudySessions } from "@/server/services/studySessionService";

export default async function SessionsPage() {
  const userId = await getUserIdOrThrow();

  const result = await listStudySessions({
    userId,
    limit: 20,
    includeResult: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-slate-900">
          Session history
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Reopen any session to review its summary, flashcards, and questions.
        </p>
      </div>

      <SessionsList
        initialSessions={result.sessions}
        initialPageInfo={result.pageInfo}
      />
    </div>
  );
}

