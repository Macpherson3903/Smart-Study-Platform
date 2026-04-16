"use client";

import type { StudyContent } from "@/lib/ai/studyContentSchema";

import { Card, CardContent } from "@/components/ui/Card";

export function KeyPointsPanel(props: { content: StudyContent }) {
  const points = props.content.key_points ?? [];

  if (points.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-slate-600">
          Key points were not generated for this session.
        </CardContent>
      </Card>
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

