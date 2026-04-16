"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserButton } from "@clerk/nextjs";

import { DASHBOARD_NAV_ITEMS } from "@/config/navigation";

export function Topbar(props: { onMenu: () => void }) {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
          onClick={props.onMenu}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
        </div>

        <Link
          href="/sessions/new"
          className="hidden rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 sm:inline-flex"
        >
          New session
        </Link>

        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}

function getTitleFromPathname(pathname: string): string {
  if (pathname === "/sessions/new" || pathname.startsWith("/sessions/new/")) {
    return "New Session";
  }

  if (pathname.startsWith("/sessions/")) {
    return "Session";
  }

  const match = DASHBOARD_NAV_ITEMS.filter((item) => {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }).sort((a, b) => b.href.length - a.href.length)[0];

  if (match) return match.label;
  return "Smart Study";
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 5.75A.75.75 0 0 1 3.75 5h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75Zm0 4.25A.75.75 0 0 1 3.75 9.25h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

