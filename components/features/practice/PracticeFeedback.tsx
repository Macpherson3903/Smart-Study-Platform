"use client";

import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";

export interface FeedbackResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  missingPoints: string[];
  suggestedAnswer: string;
}

interface PracticeFeedbackProps {
  feedback: FeedbackResult;
}

export function PracticeFeedback({ feedback }: PracticeFeedbackProps) {
  const isGood = feedback.score >= 70;
  const isPartial = feedback.score >= 40 && feedback.score < 70;

  return (
    <Card
      className={cn(
        isGood
          ? "border-emerald-200 bg-emerald-50"
          : isPartial
            ? "border-amber-200 bg-amber-50"
            : "border-red-200 bg-red-50",
      )}
    >
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <ScoreCircle score={feedback.score} />
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                isGood
                  ? "text-emerald-800"
                  : isPartial
                    ? "text-amber-800"
                    : "text-red-800",
              )}
            >
              {isGood
                ? "Great job!"
                : isPartial
                  ? "Partially correct"
                  : "Needs improvement"}
            </p>
            <p
              className={cn(
                "mt-1 text-sm",
                isGood
                  ? "text-emerald-700"
                  : isPartial
                    ? "text-amber-700"
                    : "text-red-700",
              )}
            >
              {feedback.feedback}
            </p>
          </div>
        </div>

        {feedback.missingPoints.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Missing points
            </p>
            <ul className="mt-2 space-y-1">
              {feedback.missingPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.suggestedAnswer && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Suggested answer
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {feedback.suggestedAnswer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const isGood = score >= 70;
  const isPartial = score >= 40 && score < 70;

  return (
    <div
      className={cn(
        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold",
        isGood
          ? "bg-emerald-200 text-emerald-800"
          : isPartial
            ? "bg-amber-200 text-amber-800"
            : "bg-red-200 text-red-800",
      )}
    >
      {score}
    </div>
  );
}
