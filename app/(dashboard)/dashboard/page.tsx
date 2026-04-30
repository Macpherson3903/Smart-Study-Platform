import type { Metadata } from "next";
import Link from "next/link";

import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = { title: "Dashboard" };

import { SessionCard } from "@/components/features/sessions/SessionCard";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserIdOrThrow } from "@/lib/auth";
import { listStudySessions } from "@/server/services/studySessionService";

export default async function DashboardPage() {
  const userId = await getUserIdOrThrow();
  const user = await currentUser();
  const name = user?.firstName ?? user?.username ?? "there";

  const { sessions } = await listStudySessions({
    userId,
    limit: 5,
    includeResult: false,
  });

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-pretty text-2xl font-semibold tracking-tight">
          Welcome back, {name}
        </h2>
        <p className="mt-2 text-balance text-sm text-white">
          Paste your notes, enable the outputs you want, and generate a clean
          study pack.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-white">
            Quick actions
          </h3>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <QuickActionCard
            href="/sessions/new"
            title="New session"
            description="Start a fresh study session from any text."
          />
          <QuickActionCard
            href="/sessions/new?focus=1"
            title="Paste text"
            description="Jump straight to the input box and paste notes."
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-white">
            Recent sessions
          </h3>
          <Link
            href="/sessions"
            className="text-sm font-semibold text-white hover:text-white hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-3">
          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              description="Create your first session to generate summaries, flashcards, and questions."
              action={{ label: "Create session", href: "/sessions/new" }}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function QuickActionCard(props: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={props.href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/30"
    >
      <Card className="transition hover:border-purple-300/40 hover:bg-black/45">
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-white">{props.title}</p>
          <p className="mt-1 text-sm text-white">{props.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
