"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function FlashcardsPanel(props: { content: StudyContent }) {
  const flashcards = props.content.flashcards ?? [];

  if (flashcards.length === 0) {
    return (
      <EmptyState
        title="No flashcards in this session"
        description="Generate a new session with flashcards enabled to study with cards."
        action={{ label: "New session", href: "/sessions/new" }}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {flashcards.map((f, i) => (
        <Card key={i}>
          <CardHeader className="pb-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Front
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {f.front}
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Back
            </p>
            <p className="mt-2 text-sm text-slate-700">{f.back}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
