"use client";

import { cn } from "@/lib/cn";
import type { CardInteraction } from "@/components/features/flashcards/FlashcardActions";

interface FlashcardProgressProps {
  total: number;
  currentIndex: number;
  interactions: Record<number, CardInteraction>;
  onDotClick: (index: number) => void;
}

export function FlashcardProgress({
  total,
  currentIndex,
  interactions,
  onDotClick,
}: FlashcardProgressProps) {
  return (
    <div className="flex justify-center">
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => {
          const interaction = interactions[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => onDotClick(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === currentIndex
                  ? interaction === "known"
                    ? "bg-emerald-600"
                    : interaction === "review"
                      ? "bg-amber-500"
                      : "bg-brand-600"
                  : interaction === "known"
                    ? "bg-emerald-300 hover:bg-emerald-400"
                    : interaction === "review"
                      ? "bg-amber-300 hover:bg-amber-400"
                      : "bg-slate-300 hover:bg-slate-400",
              )}
              aria-label={`Go to card ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
