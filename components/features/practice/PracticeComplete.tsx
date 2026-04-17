"use client";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardContent } from "@/components/ui/Card";
import type { FeedbackResult } from "@/components/features/practice/PracticeFeedback";

interface PracticeCompleteProps {
  sessionId: string;
  feedbacks: (FeedbackResult | null)[];
  questionTexts: string[];
  onRestart: () => void;
}

export function PracticeComplete({
  sessionId,
  feedbacks,
  questionTexts,
  onRestart,
}: PracticeCompleteProps) {
  const answered = feedbacks.filter(Boolean) as FeedbackResult[];
  const avgScore =
    answered.length > 0
      ? Math.round(
          answered.reduce((sum, f) => sum + f.score, 0) / answered.length,
        )
      : 0;
  const correct = answered.filter((f) => f.score >= 70).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Practice complete
          </p>
          <p className="mt-4 text-4xl font-bold text-slate-900">{avgScore}%</p>
          <p className="mt-2 text-sm text-slate-600">
            {correct} of {answered.length} questions answered well
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Question breakdown
        </p>
        {feedbacks.map((fb, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                fb && fb.score >= 70
                  ? "bg-emerald-100 text-emerald-700"
                  : fb && fb.score >= 40
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700",
              )}
            >
              {fb ? fb.score : "–"}
            </div>
            <p className="text-sm text-slate-700 line-clamp-1">
              {questionTexts[i]}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" onClick={onRestart}>
          Try Again
        </Button>
        <ButtonLink href={`/sessions/${sessionId}`} variant="secondary">
          Back to Session
        </ButtonLink>
      </div>
    </div>
  );
}
