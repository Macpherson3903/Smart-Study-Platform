import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SessionResults } from "@/components/features/results/SessionResults";
import { getUserIdOrThrow } from "@/lib/auth";
import { getStudySessionById } from "@/server/services/studySessionService";

export const metadata: Metadata = { title: "Session" };

export default async function SessionPage(props: {
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

  return <SessionResults initial={session} />;
}
