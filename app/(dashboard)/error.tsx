"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep full details in the console for debugging.
    // eslint-disable-next-line no-console
    console.error(props.error);
  }, [props.error]);

  const isMongoAuth = useMemo(() => {
    return /bad auth|authentication failed/i.test(props.error.message);
  }, [props.error.message]);

  const isMongoDns = useMemo(() => {
    return /ENOTFOUND|getaddrinfo/i.test(props.error.message);
  }, [props.error.message]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {isMongoAuth
            ? "Your app couldn’t authenticate to MongoDB."
            : isMongoDns
              ? "Your app couldn’t resolve the MongoDB Atlas hostname (DNS lookup failed)."
            : "An unexpected error occurred while loading this page."}
        </p>
      </div>

      <Card
        className={
          isMongoAuth || isMongoDns ? "border-amber-200 bg-amber-50" : ""
        }
      >
        <CardContent className="py-4">
          <p className="text-sm font-semibold text-slate-900">
            {isMongoAuth
              ? "MongoDB auth failed"
              : isMongoDns
                ? "MongoDB DNS lookup failed"
                : "Error details"}
          </p>
          <p className="mt-2 break-words text-sm text-slate-700">
            {props.error.message}
          </p>
          {isMongoAuth ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p className="font-semibold">Fix checklist</p>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                <li>
                  Update <code className="font-semibold">MONGODB_URI</code> in{" "}
                  <code className="font-semibold">.env.local</code> with the
                  correct username/password.
                </li>
                <li>
                  If you copied the Atlas URI, replace the{" "}
                  <code className="font-semibold">&lt;password&gt;</code>{" "}
                  placeholder and do not keep angle brackets.
                </li>
                <li>
                  URL-encode special characters in the password (e.g.{" "}
                  <code className="font-semibold">@</code> →{" "}
                  <code className="font-semibold">%40</code>).
                </li>
                <li>Restart the dev server after changing env vars.</li>
              </ul>
            </div>
          ) : isMongoDns ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p className="font-semibold">Fix checklist</p>
              <ul className="list-disc space-y-1 pl-5 text-slate-700">
                <li>
                  Re-copy your Atlas connection string host (the part after{" "}
                  <code className="font-semibold">@</code>) from Atlas → Connect
                  → Drivers.
                </li>
                <li>
                  Check DNS resolution from your machine (PowerShell):{" "}
                  <code className="font-semibold">
                    Resolve-DnsName &lt;your-cluster-host&gt;
                  </code>
                </li>
                <li>
                  If DNS fails, try switching to public DNS (1.1.1.1 or 8.8.8.8)
                  and run <code className="font-semibold">ipconfig /flushdns</code>.
                </li>
                <li>
                  Disable VPN / check firewall rules that may block{" "}
                  <code className="font-semibold">*.mongodb.net</code>.
                </li>
                <li>Restart the dev server after changing network/env vars.</li>
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={props.reset}>
          Try again
        </Button>
        <Link
          href="/sessions/new"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          New session
        </Link>
      </div>
    </div>
  );
}

