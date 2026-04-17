"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function QuestionsPanel(props: { content: StudyContent }) {
  const questions = props.content.questions ?? [];

  if (questions.length === 0) {
    return (
      <EmptyState
        title="Questions weren’t generated"
        description="Regenerate this session with questions enabled to practice them here."
        action={{ label: "New session", href: "/sessions/new" }}
      />
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <ol className="list-decimal space-y-4 pl-5 text-sm text-slate-700">
          {questions.map((q, i) => (
            <li key={i}>
              <p className="font-semibold text-slate-900">{q.question}</p>
              {q.answer && <p className="mt-1 text-slate-600">{q.answer}</p>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
