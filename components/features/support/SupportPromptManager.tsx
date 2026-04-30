"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { SupportPlatformModal } from "@/components/features/support/SupportPlatformModal";

type SupportPromptReason = "auth" | "every_2_sessions";

interface PromptResponse {
  shouldShow: boolean;
  reason?: SupportPromptReason;
  checkoutUrl: string;
}

export function SupportPromptManager() {
  const { sessionId } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<SupportPromptReason | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState("https://flutterwave.com");

  const query = useMemo(() => {
    if (!sessionId) return "";
    return `?authSessionId=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;

    async function checkEligibility() {
      try {
        const res = await fetch(`/api/support/prompt${query}`, {
          method: "GET",
        });
        if (!res.ok) return;
        const json = (await res.json()) as PromptResponse;
        if (cancelled || !json.shouldShow || !json.reason) return;
        setReason(json.reason);
        setCheckoutUrl(json.checkoutUrl);
        setOpen(true);
      } catch {
        // Best-effort prompt: silently ignore network errors.
      }
    }

    void checkEligibility();
    return () => {
      cancelled = true;
    };
  }, [pathname, query]);

  async function acknowledge(currentReason: SupportPromptReason) {
    try {
      await fetch("/api/support/prompt/ack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reason: currentReason,
          authSessionId: sessionId ?? undefined,
        }),
      });
    } catch {
      // Acknowledge writes are best-effort and should not block user actions.
    }
  }

  async function handleClose() {
    if (!reason) return;
    await acknowledge(reason);
    setOpen(false);
    setReason(null);
  }

  async function handleSupport() {
    if (!reason) return;
    await acknowledge(reason);
    window.location.assign(checkoutUrl);
  }

  return (
    <SupportPlatformModal
      open={open}
      onClose={() => void handleClose()}
      onSupport={() => void handleSupport()}
    />
  );
}
