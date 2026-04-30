"use client";

import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/community";

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
          <p className="mt-2 text-sm text-white">
            For feedback, contributions, and community discussions, join our
            WhatsApp group.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "secondary" })}
          >
            <WhatsAppIcon />
            Join community
          </a>
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

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.05 4.94A9.86 9.86 0 0 0 12 2a9.98 9.98 0 0 0-8.65 15l-1.3 4.76 4.88-1.28A10 10 0 1 0 19.05 4.94Zm-7.05 15.36a8.28 8.28 0 0 1-4.22-1.16l-.3-.18-2.9.76.77-2.82-.2-.3a8.27 8.27 0 1 1 6.85 3.7Zm4.54-6.21c-.25-.12-1.46-.72-1.69-.8-.23-.08-.4-.12-.57.12-.17.25-.65.8-.8.96-.15.17-.3.19-.56.06-.25-.12-1.06-.39-2.03-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.52.11-.11.25-.3.37-.45.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.37-.78-1.87-.2-.49-.41-.42-.57-.43l-.48-.01c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.09s.9 2.42 1.02 2.58c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.52.6.19 1.15.16 1.58.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
