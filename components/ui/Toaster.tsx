"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Project-wide toast surface. Mount once in the root layout.
 *
 * Styling follows the brand tokens defined in `app/globals.css`.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-slate-200 bg-white text-sm text-slate-900 shadow-sm",
          title: "text-sm font-semibold text-slate-900",
          description: "text-sm text-slate-600",
          actionButton:
            "rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700",
          cancelButton:
            "rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50",
          success: "border-brand-200 bg-brand-50",
          error: "border-red-200 bg-red-50",
        },
      }}
    />
  );
}
