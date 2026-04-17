import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { PublicFooter } from "@/components/shell/PublicFooter";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service for Smart Study Platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <div className="mt-8 space-y-6 text-sm text-slate-700">
          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              1. Using the service
            </h2>
            <p className="mt-2 text-slate-600">
              Smart Study Platform is an AI-powered study tool. By creating an
              account you agree to these terms and to the{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              . You must be old enough to form a binding contract in your
              jurisdiction (typically 13+, or 16+ in the EU).
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              2. Your content
            </h2>
            <p className="mt-2 text-slate-600">
              You keep ownership of the text you paste and the materials
              generated from it. You grant us a limited license to process that
              content to operate the service (store it, pass it to the AI
              provider, and return results to you).
            </p>
            <p className="mt-2 text-slate-600">
              Do not upload content you do not have the right to use, content
              that infringes someone else&apos;s rights, or content that
              violates the law.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              3. Acceptable use
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              <li>No automated abuse of the generation endpoint.</li>
              <li>No attempts to bypass rate limits or per-account quotas.</li>
              <li>
                No reverse engineering the service to extract model prompts or
                another user&apos;s data.
              </li>
              <li>
                No content that violates Google&apos;s{" "}
                <Link
                  className="underline"
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gemini API terms
                </Link>{" "}
                or our hosting providers&apos; terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">4. Quotas</h2>
            <p className="mt-2 text-slate-600">
              We enforce per-user rate limits and daily caps on AI generation.
              Quotas may change as the service evolves. Current limits are
              surfaced via the response headers on rate-limited requests.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              5. Availability
            </h2>
            <p className="mt-2 text-slate-600">
              The service is provided on an &quot;as is&quot; basis. We
              don&apos;t promise uptime SLAs. We may take the service offline
              for maintenance, cost reasons, or if abuse threatens the product.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              6. AI output
            </h2>
            <p className="mt-2 text-slate-600">
              AI-generated study materials can be wrong, incomplete, or
              misleading. Verify important facts before relying on them — this
              is a study aid, not an authority.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              7. Termination
            </h2>
            <p className="mt-2 text-slate-600">
              You may delete your account at any time via Clerk&apos;s account
              settings. We may suspend or terminate accounts that violate these
              terms or that put the service at risk.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              8. Limitation of liability
            </h2>
            <p className="mt-2 text-slate-600">
              To the maximum extent permitted by law, Smart Study Platform and
              its contributors are not liable for indirect, incidental, or
              consequential damages arising from use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">9. Changes</h2>
            <p className="mt-2 text-slate-600">
              We may update these terms. Material changes are announced via the
              project&apos;s GitHub releases and dated on this page. Continued
              use after a change constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">
              10. License
            </h2>
            <p className="mt-2 text-slate-600">
              The application source code is MIT-licensed. The license covers
              the code, not your data or the AI output you generate.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
