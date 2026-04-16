"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent } from "@/components/ui/Card";

export function SummaryPanel(props: { content: StudyContent }) {
  const text = props.content.summary?.trim();

  if (!text) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-slate-600">
          Summary was not generated for this session.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}

