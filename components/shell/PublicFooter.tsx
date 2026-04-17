import Link from "next/link";

/**
 * Minimal legal + navigation footer rendered on public surfaces (marketing,
 * sign-in / sign-up, legal pages). The dashboard has its own chrome and does
 * not use this component.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 p-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Smart Study Platform. MIT licensed.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          <a
            href="https://github.com/Macpherson3903/Smart-Study-Platform"
            className="hover:text-slate-900"
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
