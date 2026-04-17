"use client";

import { Button } from "@/components/ui/Button";

interface FlashcardControlsProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
}

export function FlashcardControls({
  index,
  total,
  onPrev,
  onNext,
  onShuffle,
}: FlashcardControlsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          {index + 1} / {total}
        </p>
        <Button variant="secondary" size="sm" onClick={onShuffle}>
          Shuffle
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" onClick={onPrev} disabled={index === 0}>
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={index === total - 1}
        >
          Next
        </Button>
      </div>
    </>
  );
}
