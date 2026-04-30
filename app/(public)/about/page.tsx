import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getOptionalUserId } from "@/lib/auth";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Smart Study Platform was built and the mission behind helping learners balance work and study.",
};

export default async function AboutPage() {
  const userId = await getOptionalUserId();
  const accountHref = userId ? "/dashboard" : "/sign-up";
  const accountLabel = userId ? "Go to dashboard" : "Create account";

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
            About Smart Study Platform
          </h1>
          <p className="mt-4 max-w-3xl text-balance text-lg text-white">
            This project started from a real challenge: managing work demands and
            study goals at the same time, with limited time and energy.
          </p>

          <section className="launch-card mt-10 p-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              Why this platform exists
            </h2>
            <p className="mt-4 leading-7 text-white">
              When your schedule is full, studying can feel overwhelming. Long
              texts take time to break down, and it is hard to stay consistent.
              Smart Study Platform was built to remove that friction by turning
              raw content into practical study materials quickly.
            </p>
            <p className="mt-4 leading-7 text-white">
              The goal is simple: help learners make meaningful progress even in
              short study windows before work, after work, or between
              responsibilities.
            </p>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="launch-card p-6">
              <h3 className="font-semibold text-white">Speed</h3>
              <p className="mt-2 text-sm text-white">
                Convert dense text into focused outputs in seconds.
              </p>
            </article>
            <article className="launch-card p-6">
              <h3 className="font-semibold text-white">Clarity</h3>
              <p className="mt-2 text-sm text-white">
                Reduce information overload and prioritize what matters.
              </p>
            </article>
            <article className="launch-card p-6">
              <h3 className="font-semibold text-white">Consistency</h3>
              <p className="mt-2 text-sm text-white">
                Keep learning momentum despite a busy schedule.
              </p>
            </article>
          </section>

          <section className="launch-card mt-8 p-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              Join the mission
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white">
              If you are balancing work and study too, this platform is built for
              you. Start free and build a better study rhythm.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={accountHref} variant="primary">
                {accountLabel}
              </ButtonLink>
              <ButtonLink href="/donate" variant="secondary">
                Support the platform
              </ButtonLink>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
