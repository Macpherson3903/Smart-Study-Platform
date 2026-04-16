"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent } from "@/components/ui/Card";

export function QuestionsPanel(props: { content: StudyContent }) {
  const questions = props.content.questions ?? [];

  if (questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-slate-600">
          Questions were not generated for this session.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

