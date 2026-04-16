"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "default" | "success" | "warning" | "danger";

const styles: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        styles[variant],
        className,
      )}
    />
  );
}
