"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export type AlertTone = "error" | "warning" | "info" | "success";

type AlertAction = { label: string; onClick: () => void };

export function Alert(props: {
  tone?: AlertTone;
  title: string;
  description?: ReactNode;
  action?: AlertAction;
  secondaryAction?: AlertAction;
  className?: string;
  children?: ReactNode;
}) {
  const tone = props.tone ?? "info";
  const styles = toneStyles[tone];

  return (
    <Card
      role={tone === "error" ? "alert" : "status"}
      className={cn(styles.card, props.className)}
    >
      <CardContent className="py-4">
        <p className={cn("text-sm font-semibold", styles.title)}>
          {props.title}
        </p>
        {props.description ? (
          <p className={cn("mt-1 text-sm", styles.description)}>
            {props.description}
          </p>
        ) : null}
        {props.children ? <div className="mt-2">{props.children}</div> : null}
        {props.action || props.secondaryAction ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {props.action ? (
              <Button
                variant={tone === "error" ? "destructive" : "primary"}
                size="sm"
                onClick={props.action.onClick}
              >
                {props.action.label}
              </Button>
            ) : null}
            {props.secondaryAction ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={props.secondaryAction.onClick}
              >
                {props.secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const toneStyles: Record<
  AlertTone,
  { card: string; title: string; description: string }
> = {
  error: {
    card: "border-red-200 bg-red-50",
    title: "text-red-800",
    description: "text-red-700",
  },
  warning: {
    card: "border-amber-200 bg-amber-50",
    title: "text-amber-800",
    description: "text-amber-700",
  },
  info: {
    card: "border-brand-200 bg-brand-50",
    title: "text-brand-800",
    description: "text-brand-700",
  },
  success: {
    card: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-800",
    description: "text-emerald-700",
  },
};
