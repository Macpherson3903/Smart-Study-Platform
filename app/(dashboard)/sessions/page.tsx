import type { Metadata } from "next";

import { SessionsList } from "@/components/features/sessions/SessionsList";
import { SessionsSearchBar } from "@/components/features/sessions/SessionsSearchBar";
import { getUserIdOrThrow } from "@/lib/auth";
import { listStudySessions } from "@/server/services/studySessionService";

export const metadata: Metadata = { title: "Session History" };

type SearchParams = Promise<{ q?: string | string[] }>;

export default async function SessionsPage(props: {
  searchParams: SearchParams;
}) {
  const userId = await getUserIdOrThrow();
  const sp = await props.searchParams;
  const qRaw = sp.q;
  const q = typeof qRaw === "string" ? qRaw.trim() : undefined;

  const result = await listStudySessions({
    userId,
    limit: 20,
    includeResult: false,
    q,
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

      <SessionsSearchBar />

      <SessionsList
        initialSessions={result.sessions}
        initialPageInfo={result.pageInfo}
        q={q && q.length > 0 ? q : undefined}
      />
    </div>
  );
}
