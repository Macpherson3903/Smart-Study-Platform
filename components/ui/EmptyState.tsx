"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Card, CardContent } from "@/components/ui/Card";

export type EmptyStateAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

export function EmptyState(props: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  tone?: "neutral" | "hint";
  className?: string;
}) {
  const tone = props.tone ?? "hint";

  return (
    <Card
      className={cn(tone === "hint" ? "border-dashed" : "", props.className)}
    >
      <CardContent className="py-10 text-center">
        {props.icon ? (
          <div
            aria-hidden="true"
            className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            {props.icon}
          </div>
        ) : null}
        <p className="text-sm font-semibold text-slate-900">{props.title}</p>
        {props.description ? (
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {props.description}
          </p>
        ) : null}
        {props.action || props.secondaryAction ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {props.action ? (
              <ActionLink action={props.action} variant="primary" />
            ) : null}
            {props.secondaryAction ? (
              <ActionLink action={props.secondaryAction} variant="secondary" />
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActionLink(props: {
  action: EmptyStateAction;
  variant: "primary" | "secondary";
}) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors";
  const variantCls =
    props.variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700"
      : "border border-slate-200 bg-white text-slate-900 hover:border-brand-200 hover:bg-brand-50";

  if ("href" in props.action && props.action.href) {
    return (
      <Link href={props.action.href} className={cn(base, variantCls)}>
        {props.action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={props.action.onClick}
      className={cn(base, variantCls)}
    >
      {props.action.label}
    </button>
  );
}
