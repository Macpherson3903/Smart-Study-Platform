"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export function SupportPlatformModal(props: {
  open: boolean;
  onClose: () => void;
  onSupport: () => void;
}) {
  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Support Smart Study Platform"
    >
      <Card className="w-full max-w-md border-purple-300/25 bg-black/80 text-white shadow-2xl">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold tracking-tight text-white">
            Support Smart Study Platform
          </h3>
          <p className="mt-1 text-sm text-white">
            Your support helps cover AI and hosting costs so the platform stays
            fast, reliable, and available for learners.
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={props.onClose}>
            Maybe later
          </Button>
          <Button variant="primary" onClick={props.onSupport}>
            Support now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
