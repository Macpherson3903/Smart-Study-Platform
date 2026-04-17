"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SpinnerProps = Omit<HTMLAttributes<SVGElement>, "children"> & {
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeStyles: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function Spinner({
  className,
  size = "sm",
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <svg
      {...props}
      role="status"
      aria-label={label}
      className={cn("animate-spin", sizeStyles[size], className)}
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
      />
    </svg>
  );
}
