"use client";

import type { StudySessionStatus } from "@/models/StudySession";

import { Badge } from "@/components/ui/Badge";

export function SessionStatusBadge(props: { status: StudySessionStatus }) {
  if (props.status === "complete") {
    return <Badge variant="success">Complete</Badge>;
  }

  if (props.status === "pending") {
    return <Badge variant="warning">Generating</Badge>;
  }

  return <Badge variant="danger">Error</Badge>;
}
