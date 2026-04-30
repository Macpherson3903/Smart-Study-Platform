import { BrandMark } from "@/components/brand/BrandMark";
import { TestimonialsSection } from "@/components/features/feedback/TestimonialsSection";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getOptionalUserId } from "@/lib/auth";
import { listFeedbackTestimonials } from "@/server/services/feedbackService";
import Link from "next/link";

export default async function HomePage() {
  const userId = await getOptionalUserId();
  const testimonials = await listFeedbackTestimonials();
  const primaryHref = userId ? "/dashboard" : "/sign-up";
  const primaryLabel = userId ? "Go to dashboard" : "Start studying now";
  const authHref = userId ? "/dashboard" : "/sign-in";
  const authLabel = userId ? "Dashboard" : "Sign in";

  return (
    <>
      <main className="launch-surface min-h-dvh text-white">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full border border-purple-300/20 bg-black/30 px-4 py-2"
            >
              <BrandMark size={24} withText={false} />
              <span className="text-sm font-semibold tracking-tight text-white">
                Smart Study Platform
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-white">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/feedback" className="hover:text-white">
                Feedback
              </Link>
              <Link href="/donate" className="hover:text-white">
                Donate
              </Link>
              <Link href={authHref} className="hover:text-white">
                {authLabel}
              </Link>
            </nav>
          </header>

          <section className="pt-18 pb-16 sm:pt-24">
            <p className="inline-flex rounded-full border border-purple-300/25 bg-purple-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Product launch
            </p>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Learn faster when your day is split between work and study.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white">
              Smart Study Platform turns long academic text into clear summaries,
              flashcards, and practice questions so you can make progress even in
              short study windows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={primaryHref} variant="primary">
                {primaryLabel}
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                Why we built this
              </ButtonLink>
            </div>
          </section>

          <section className="grid gap-6 pb-16 md:grid-cols-3">
            <article className="launch-card p-6">
              <h2 className="text-lg font-semibold text-white">The problem</h2>
              <p className="mt-3 text-sm leading-6 text-white">
                Balancing a job and study means limited time, mental fatigue, and
                information overload.
              </p>
            </article>
            <article className="launch-card p-6">
              <h2 className="text-lg font-semibold text-white">The solution</h2>
              <p className="mt-3 text-sm leading-6 text-white">
                Paste your material once and get a complete study pack focused on
                what matters most.
              </p>
            </article>
            <article className="launch-card p-6">
              <h2 className="text-lg font-semibold text-white">The result</h2>
              <p className="mt-3 text-sm leading-6 text-white">
                You spend less time organizing notes and more time understanding
                and retaining key ideas.
              </p>
            </article>
          </section>

          <section className="pb-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              Built for productive study sessions
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <article className="launch-card p-5">
                <p className="text-sm font-semibold text-white">Summary</p>
                <p className="mt-2 text-sm text-white">
                  Get the main ideas instantly so you can revise efficiently.
                </p>
              </article>
              <article className="launch-card p-5">
                <p className="text-sm font-semibold text-white">
                  Flashcards
                </p>
                <p className="mt-2 text-sm text-white">
                  Convert dense topics into quick active-recall prompts.
                </p>
              </article>
              <article className="launch-card p-5">
                <p className="text-sm font-semibold text-white">
                  Practice questions
                </p>
                <p className="mt-2 text-sm text-white">
                  Test understanding and get feedback on your answers.
                </p>
              </article>
            </div>
          </section>

          <section className="pb-16">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              <li className="launch-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                  Step 1
                </p>
                <p className="mt-2 font-semibold">Paste your study content</p>
              </li>
              <li className="launch-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                  Step 2
                </p>
                <p className="mt-2 font-semibold">Choose what to generate</p>
              </li>
              <li className="launch-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                  Step 3
                </p>
                <p className="mt-2 font-semibold">Review and practice anytime</p>
              </li>
            </ol>
          </section>

          <TestimonialsSection testimonials={testimonials} />

          <section className="launch-card mb-8 p-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              Launching a smarter way to study under pressure
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white">
              This platform was inspired by real time constraints: working long
              hours while still needing to study effectively. Support the mission
              or start using the platform today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={primaryHref} variant="primary">
                {primaryLabel}
              </ButtonLink>
              <ButtonLink href="/donate" variant="secondary">
                Support with a donation
              </ButtonLink>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
