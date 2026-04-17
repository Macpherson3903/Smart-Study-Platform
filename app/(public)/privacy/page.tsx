import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { PublicFooter } from "@/components/shell/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Smart Study Platform collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <BrandMark size={20} withText={false} />
          <span>Smart Study Platform</span>
        </Link>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="mt-8 space-y-6 text-sm text-slate-700">
          <section>
            <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
            <p className="mt-2 text-slate-600">
              Smart Study Platform stores the minimum required to deliver the
              service: your account identity (through Clerk) and the study
              sessions you create. We do not sell data, we do not run
              third-party advertising trackers, and we share your content only
              with the AI provider required to generate study materials.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              What we collect
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              <li>
                <span className="font-semibold text-slate-700">
                  Account data
                </span>{" "}
                via{" "}
                <Link
                  className="underline"
                  href="https://clerk.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Clerk
                </Link>
                : email, first name (if you provide one), and an opaque user id.
              </li>
              <li>
                <span className="font-semibold text-slate-700">
                  Study input
                </span>
                : the text you paste into the generator and the options you
                toggle.
              </li>
              <li>
                <span className="font-semibold text-slate-700">
                  Generated content
                </span>
                : summaries, flashcards, and practice questions produced from
                your input.
              </li>
              <li>
                <span className="font-semibold text-slate-700">
                  Operational logs
                </span>
                : request ids, timestamps, and error traces, retained up to 30
                days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              How we use it
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              <li>To authenticate you and scope sessions to your account.</li>
              <li>
                To send your input text to{" "}
                <Link
                  className="underline"
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Gemini
                </Link>{" "}
                and return its response to you.
              </li>
              <li>
                To debug failures and prevent abuse (for example, per-user rate
                limits).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              Who we share it with
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              <li>Clerk — authentication.</li>
              <li>MongoDB Atlas — database hosting.</li>
              <li>Google (Gemini API) — AI generation.</li>
              <li>Vercel — application hosting and delivery.</li>
            </ul>
            <p className="mt-2 text-slate-600">
              Each provider has its own privacy policy. We do not share your
              data with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Retention</h2>
            <p className="mt-2 text-slate-600">
              Study sessions remain until you delete them. You can delete any
              session from the session detail page. Deleting your account via
              Clerk removes your authentication record; database content linked
              to your user id is removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              Your rights
            </h2>
            <p className="mt-2 text-slate-600">
              You can request a copy of your data, corrections, or deletion by
              emailing the address on{" "}
              <Link
                className="underline"
                href="https://github.com/Macpherson3903/Smart-Study-Platform"
                target="_blank"
                rel="noopener noreferrer"
              >
                our GitHub page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Security</h2>
            <p className="mt-2 text-slate-600">
              We enforce HTTPS with HSTS, sandbox third-party frames, rate-limit
              AI generation per user, and scope every database read by user id
              at the repository layer. See{" "}
              <Link
                className="underline"
                href="https://github.com/Macpherson3903/Smart-Study-Platform/blob/main/SECURITY.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                SECURITY.md
              </Link>{" "}
              to report a vulnerability.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Changes</h2>
            <p className="mt-2 text-slate-600">
              Material changes are posted to this page and announced via the
              project&apos;s GitHub releases. The &quot;Last updated&quot; date
              above always reflects the latest revision.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
