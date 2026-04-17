"use client";

import { useEffect } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { logger } from "@/lib/logger";

export default function PublicError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.exception(props.error, { boundary: "public" });
  }, [props.error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-8 text-center">
      <BrandMark size={32} withText={false} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="primary" onClick={props.reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </main>
  );
}
