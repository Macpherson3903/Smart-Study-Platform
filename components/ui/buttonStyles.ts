import { cn } from "@/lib/cn";

/**
 * Shared visual tokens for `Button` and `ButtonLink`. Kept in a plain module
 * (no `"use client"`) so both client and server components can compose the
 * classes without crossing the RSC boundary.
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md";

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50",
  secondary:
    "border border-slate-200 bg-white text-slate-900 hover:border-brand-200 hover:bg-brand-50 disabled:bg-white/50",
  ghost:
    "text-slate-700 hover:bg-brand-50 hover:text-slate-900 disabled:text-slate-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-600/50",
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export const buttonBaseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed";

/**
 * Returns the Tailwind class string for the shared Button look & feel.
 * Safe to call from both client and server components.
 */
export function buttonClasses(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    buttonBaseStyles,
    buttonVariantStyles[opts?.variant ?? "primary"],
    buttonSizeStyles[opts?.size ?? "md"],
    opts?.className,
  );
}
