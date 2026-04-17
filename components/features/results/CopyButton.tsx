"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

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
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn’t copy", {
        description: "Clipboard access was blocked by your browser.",
      });
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
      {copied ? "Copied" : (props.label ?? "Copy")}
    </Button>
  );
}
