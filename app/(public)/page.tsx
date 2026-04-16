import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { getOptionalUserId } from "@/lib/auth";

export default async function HomePage() {
  const userId = await getOptionalUserId();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center p-8">
      <div className="flex items-center gap-3">
        <BrandMark size={36} withText={false} />
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">
          Smart Study Platform
        </h1>
      </div>
      <p className="mt-3 text-balance text-slate-600">
        Transform raw academic content into structured learning materials in
        seconds.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {userId ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Create account
            </Link>
          </>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">What you can do</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
          <li>Generate summaries and key points</li>
          <li>Create flashcards and questions</li>
          <li>Review your session history</li>
        </ul>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-300" />
          <span className="inline-flex h-2 w-2 rounded-full bg-accent-700" />
          <span className="ml-1">Brand palette</span>
        </div>
      </div>
    </main>
  );
}

