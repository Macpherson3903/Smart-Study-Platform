import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getOptionalUserId } from "@/lib/auth";

const DONATE_URL =
  process.env.NEXT_PUBLIC_FLUTTERWAVE_DONATION_URL ??
  "https://flutterwave.com";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Smart Study Platform with a donation and help keep the platform improving for busy learners.",
};

export default async function DonatePage() {
  const userId = await getOptionalUserId();
  const accountHref = userId ? "/dashboard" : "/sign-up";
  const accountLabel = userId ? "Go to dashboard" : "Create free account";

  return (
    <>
      <main className="launch-surface min-h-dvh text-white">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white hover:text-white"
          >
            <BrandMark size={20} withText={false} />
            <span>Smart Study Platform</span>
          </Link>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
            Support the mission
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white">
            Your donation helps keep Smart Study Platform available and improving
            for students who are balancing work, responsibilities, and learning.
          </p>

          <section className="launch-card mt-10 p-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              Why your support matters
            </h2>
            <p className="mt-4 leading-7 text-white">
              Running AI-powered study tools has real costs. Donations help fund
              model usage, hosting, and ongoing improvements so the platform can
              stay useful and accessible.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Donate now
              </a>
              <ButtonLink href={accountHref} variant="secondary">
                {accountLabel}
              </ButtonLink>
            </div>
            <p className="mt-3 text-xs text-white">
              Donations are processed on a secure external Flutterwave payment
              page.
            </p>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="launch-card p-6">
              <h3 className="font-semibold text-white">Starter support</h3>
              <p className="mt-2 text-sm text-white">
                Helps cover base hosting and maintenance.
              </p>
            </article>
            <article className="launch-card p-6">
              <h3 className="font-semibold text-white">Growth support</h3>
              <p className="mt-2 text-sm text-white">
                Contributes to AI generation costs for more learners.
              </p>
            </article>
            <article className="launch-card p-6">
              <h3 className="font-semibold text-white">Mission support</h3>
              <p className="mt-2 text-sm text-white">
                Accelerates new features and platform reliability upgrades.
              </p>
            </article>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
