"use client";

import { cn } from "@/lib/cn";

export type CardInteraction = "known" | "review";

interface FlashcardActionsProps {
  currentInteraction: CardInteraction | undefined;
  onMark: (interaction: CardInteraction) => void;
}

export function FlashcardActions({
  currentInteraction,
  onMark,
}: FlashcardActionsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onMark("known")}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
          currentInteraction === "known"
            ? "bg-emerald-600 text-white"
            : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        )}
      >
        <CheckIcon />I Know This
      </button>
      <button
        type="button"
        onClick={() => onMark("review")}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
          currentInteraction === "review"
            ? "bg-amber-500 text-white"
            : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        )}
      >
        <FlagIcon />
        Review Later
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.657-.348a6.449 6.449 0 0 1 4.271.572 7.948 7.948 0 0 0 5.965.524l.078-.028a.75.75 0 0 0 .478-.756l-.483-5.18a.75.75 0 0 0-.963-.63 6.448 6.448 0 0 1-4.872-.422 7.95 7.95 0 0 0-5.253-.704L3.5 6.793V2.75Z" />
    </svg>
  );
}
