"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function GenerationLoadingPanel(props: { label?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-semibold text-slate-900">
          {props.label ?? "Generating study materials…"}
        </p>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}
