"use client";

import { useEffect } from "react";

import { logger } from "@/lib/logger";

/**
 * Last-resort error boundary that replaces the entire document tree when the
 * root layout itself crashes. Because it fires ABOVE the root layout, it must
 * render its own `<html>` and `<body>` and cannot depend on Tailwind-only
 * styling from `globals.css`. Keep it dependency-free and inline-styled.
 */
export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.exception(props.error, { boundary: "global" });
  }, [props.error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Smart Study Platform is unavailable
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: "#475569",
            }}
          >
            A critical error prevented the app from loading. Try again, or come
            back in a minute.
          </p>
          {props.error.digest ? (
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.75rem",
                color: "#64748b",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              Reference: {props.error.digest}
            </p>
          ) : null}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={props.reset}
              style={{
                height: 40,
                padding: "0 1rem",
                borderRadius: 6,
                border: "none",
                background: "#0284c7",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* global-error replaces the root layout, so we deliberately */}
            {/* use a plain anchor to force a full reload rather than a */}
            {/* client-side Link that depends on the broken tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                height: 40,
                padding: "0 1rem",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
