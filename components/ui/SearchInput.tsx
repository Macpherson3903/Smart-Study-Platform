"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  onClear?: () => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, ...props }, ref) => {
    const hasValue = typeof value === "string" && value.length > 0;

    return (
      <div className={cn("relative w-full", className)}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white"
        >
          <SearchIcon />
        </span>
        <input
          ref={ref}
          type="search"
          value={value}
          aria-label={props["aria-label"] ?? "Search"}
          {...props}
          className={cn(
            "h-10 w-full rounded-md border border-purple-300/25 bg-black/35 pl-10 pr-10 text-sm text-white shadow-sm placeholder:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/30 disabled:cursor-not-allowed disabled:bg-black/20",
          )}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className="absolute inset-y-0 right-2 my-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-white hover:bg-purple-500/15 hover:text-white"
          >
            <ClearIcon />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 3 3" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}
