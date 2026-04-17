"use client";

interface PracticeQuestionProps {
  questionText: string;
  currentIndex: number;
  total: number;
}

export function PracticeQuestion({
  questionText,
  currentIndex,
  total,
}: PracticeQuestionProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        Question {currentIndex + 1} of {total}
      </p>
      <p className="mt-3 text-lg font-semibold text-slate-900">
        {questionText}
      </p>
    </div>
  );
}
