"use client";

import { cn } from "@/lib/cn";

interface FlashcardCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardCard({
  front,
  back,
  isFlipped,
  onFlip,
}: FlashcardCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="flip-perspective block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:rounded-xl"
      aria-label={isFlipped ? "Show front" : "Show back"}
    >
      <div
        className={cn("flip-inner relative min-h-52", isFlipped && "flipped")}
      >
        {/* Front face */}
        <div className="flip-face absolute inset-0 rounded-xl border border-slate-200 bg-white">
          <div className="flex min-h-52 flex-col justify-center px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Front{" "}
              <span className="font-normal normal-case text-slate-400">
                — click to flip
              </span>
            </p>
            <p className="mt-4 text-lg font-semibold text-slate-900">{front}</p>
          </div>
        </div>

        {/* Back face */}
        <div className="flip-back absolute inset-0 rounded-xl border border-brand-200 bg-brand-50">
          <div className="flex min-h-52 flex-col justify-center px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Back{" "}
              <span className="font-normal normal-case text-slate-400">
                — click to flip
              </span>
            </p>
            <p className="mt-4 text-lg text-brand-800">{back}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
