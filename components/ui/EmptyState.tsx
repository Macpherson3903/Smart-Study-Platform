"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";

import { Card, CardContent } from "@/components/ui/Card";

export function EmptyState(props: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed", props.className)}>
      <CardContent className="py-10 text-center">
        <p className="text-sm font-semibold text-slate-900">{props.title}</p>
        {props.description ? (
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {props.description}
          </p>
        ) : null}
        {props.action ? (
          <div className="mt-6">
            <Link
              href={props.action.href}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {props.action.label}
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

