"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled,
}: AnswerInputProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        disabled={disabled}
        rows={4}
        className={cn(
          "w-full resize-y rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 shadow-sm placeholder:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 disabled:cursor-not-allowed disabled:bg-slate-50",
          disabled && "opacity-60",
        )}
      />
      <Button
        variant="primary"
        onClick={onSubmit}
        isLoading={isSubmitting}
        disabled={disabled || value.trim().length === 0}
      >
        Submit Answer
      </Button>
    </div>
  );
}
