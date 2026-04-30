import Link from "next/link";

/**
 * Minimal legal + navigation footer rendered on public surfaces (marketing,
 * sign-in / sign-up, legal pages). The dashboard has its own chrome and does
 * not use this component.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-purple-300/20 bg-[#080511] text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 p-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Smart Study Platform. MIT licensed.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/feedback" className="hover:text-white">
            Feedback
          </Link>
          <Link href="/feedback#post-review" className="hover:text-white">
            Write a review
          </Link>
          <Link href="/donate" className="hover:text-white">
            Donate
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <a
            href="https://github.com/Macpherson3903/Smart-Study-Platform"
            className="hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
