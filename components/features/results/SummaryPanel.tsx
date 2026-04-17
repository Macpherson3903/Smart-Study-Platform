"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function SummaryPanel(props: { content: StudyContent }) {
  const text = props.content.summary?.trim();

  if (!text) {
    return (
      <EmptyState
        title="Summary wasn’t generated"
        description="Regenerate this session with summary enabled to read it here."
        action={{ label: "New session", href: "/sessions/new" }}
      />
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
