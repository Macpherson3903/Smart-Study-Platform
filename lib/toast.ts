"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Thin wrapper around the Sonner toast API.
 *
 * This indirection exists so the underlying toast provider can be swapped
 * later (for in-house implementation or a different library) without a
 * codebase-wide refactor of every call site. All product code should import
 * from `@/lib/toast`, never directly from `sonner`.
 */

type ToastOptions = {
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
};

function success(message: string, options?: ToastOptions) {
  sonnerToast.success(message, {
    description: options?.description,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
    duration: options?.duration,
  });
}

function error(message: string, options?: ToastOptions) {
  sonnerToast.error(message, {
    description: options?.description,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
    duration: options?.duration,
  });
}

function info(message: string, options?: ToastOptions) {
  sonnerToast(message, {
    description: options?.description,
    duration: options?.duration,
  });
}

function promise<T>(
  p: Promise<T>,
  messages: {
    loading: string;
    success: string | ((value: T) => string);
    error: string | ((err: unknown) => string);
  },
) {
  sonnerToast.promise(p, messages);
}

export const toast = {
  success,
  error,
  info,
  promise,
} as const;
