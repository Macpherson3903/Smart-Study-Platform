import { BrandMark } from "@/components/brand/BrandMark";
import { PublicFooter } from "@/components/shell/PublicFooter";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getOptionalUserId } from "@/lib/auth";

export default async function HomePage() {
  const userId = await getOptionalUserId();

  return (
    <>
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
            <ButtonLink href="/dashboard" variant="primary">
              Go to dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/sign-in" variant="primary">
                Sign in
              </ButtonLink>
              <ButtonLink href="/sign-up" variant="secondary">
                Create account
              </ButtonLink>
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
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
