"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function CopyButton(props: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback: do nothing; clipboard may be blocked in some contexts.
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onCopy}
      className={props.className}
    >
      {copied ? "Copied" : props.label ?? "Copy"}
    </Button>
  );
}

