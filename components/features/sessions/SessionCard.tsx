"use client";

import Link from "next/link";

import type { StudySessionListItem } from "@/models/StudySession";
import { cn } from "@/lib/cn";

import { Card, CardContent } from "@/components/ui/Card";
import { SessionStatusBadge } from "@/components/features/sessions/SessionStatusBadge";

export function SessionCard(props: {
  session: StudySessionListItem;
  className?: string;
}) {
  const { session } = props;
  const preview = truncate(session.inputTextPreview, 160);

  return (
    <Link
      href={`/sessions/${session.id}`}
      className={cn(
        "block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25",
        props.className,
      )}
    >
      <Card className="transition hover:border-slate-300 hover:shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-3">
            <SessionStatusBadge status={session.status} />
            <span className="text-xs text-slate-500">
              {formatIsoDate(session.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{preview}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatIsoDate(iso: string) {
  // ISO from API is already UTC; keep display stable in client/server.
  return iso.slice(0, 10);
}

function truncate(text: string, maxChars: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars - 1)}…`
    : normalized;
}

