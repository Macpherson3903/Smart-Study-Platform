"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { DASHBOARD_NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/cn";

export function Sidebar(props: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar mobileOpen={props.mobileOpen} onClose={props.onClose} />
    </>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  const activeHref = useActiveHref(pathname);

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-full flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center px-4">
          <Link
            href="/dashboard"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25"
          >
            <BrandMark />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              href={item.href}
              label={item.label}
              disabled={item.disabled}
              active={activeHref === item.href}
            />
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>v1 • MIT</span>
        </div>
      </div>
    </aside>
  );
}

function MobileSidebar(props: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const activeHref = useActiveHref(pathname);

  if (!props.mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30"
        aria-label="Close navigation"
        onClick={props.onClose}
      />

      <div className="relative h-full w-80 max-w-[85vw] bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25"
            onClick={props.onClose}
          >
            <BrandMark />
          </Link>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={props.onClose}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="space-y-1 px-2 py-3">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              href={item.href}
              label={item.label}
              disabled={item.disabled}
              active={activeHref === item.href}
              onNavigate={props.onClose}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavLink(props: {
  href: string;
  label: string;
  active: boolean;
  disabled?: boolean;
  onNavigate?: () => void;
}) {
  const base =
    "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium";

  const className = cn(
    base,
    props.disabled
      ? "cursor-not-allowed text-slate-400"
      : props.active
        ? "bg-brand-600 text-white"
        : "text-slate-700 hover:bg-brand-50 hover:text-slate-900",
  );

  if (props.disabled) {
    return (
      <div className={className} aria-disabled="true">
        <span>{props.label}</span>
        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link href={props.href} className={className} onClick={props.onNavigate}>
      <span>{props.label}</span>
    </Link>
  );
}

function useActiveHref(pathname: string) {
  return useMemo(() => {
    const match = DASHBOARD_NAV_ITEMS.filter((item) => {
      if (item.disabled) return false;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }).sort((a, b) => b.href.length - a.href.length)[0];

    return match?.href ?? null;
  }, [pathname]);
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

