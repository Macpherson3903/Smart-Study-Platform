"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export function FlashcardsPanel(props: { content: StudyContent }) {
  const flashcards = props.content.flashcards ?? [];

  if (flashcards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-slate-600">
          Flashcards were not generated for this session.
        </CardContent>
      </Card>
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
            <p className="mt-2 text-sm font-semibold text-slate-900">{f.front}</p>
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

