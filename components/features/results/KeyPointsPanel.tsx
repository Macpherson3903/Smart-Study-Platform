"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function KeyPointsPanel(props: { content: StudyContent }) {
  const points = props.content.key_points ?? [];

  if (points.length === 0) {
    return (
      <EmptyState
        title="Key points weren’t generated"
        description="Regenerate this session to see the key points here."
        action={{ label: "New session", href: "/sessions/new" }}
      />
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
