import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { FeedbackPageClient } from "@/components/features/feedback/FeedbackPageClient";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { getOptionalUserId } from "@/lib/auth";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/community";
import { listFeedbackReviews } from "@/server/services/feedbackService";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Read user feedback, ratings, comments, and replies for Smart Study Platform.",
  alternates: {
    canonical: "/feedback",
  },
  openGraph: {
    title: "Community Feedback | Smart Study Platform",
    description:
      "Explore user ratings and comments from learners using Smart Study Platform.",
    url: "https://smartstudyplatform.vercel.app/feedback",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Feedback | Smart Study Platform",
    description: "See what learners are saying about Smart Study Platform.",
    images: ["/twitter-image"],
  },
};

export default async function FeedbackPage() {
  const userId = await getOptionalUserId();
  const result = await listFeedbackReviews({ limit: 10 });

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
            Community feedback
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white">
            Share your experience, rate the platform, and join the discussion.
          </p>
          <p className="mt-2 text-sm text-white">
            Want faster community discussion?{" "}
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Join our WhatsApp group
            </a>
            .
          </p>

          <section className="mt-8">
            <FeedbackPageClient
              initialReviews={result.reviews}
              initialPageInfo={result.pageInfo}
              isAuthenticated={Boolean(userId)}
            />
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
