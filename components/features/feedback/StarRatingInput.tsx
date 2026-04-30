"use client";

import { cn } from "@/lib/cn";

export function StarRatingInput(props: {
  value: number;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= props.value;
        return (
          <button
            key={star}
            type="button"
            disabled={props.disabled}
            className={cn(
              "rounded p-1 text-xl leading-none transition",
              active ? "text-amber-300" : "text-slate-400",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            onClick={() => props.onChange(star as 1 | 2 | 3 | 4 | 5)}
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
