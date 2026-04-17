"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/ui/SearchInput";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/**
 * Owns the live text in the search input, debounces it, and syncs it to the
 * URL's `?q=` param via `router.replace()`. The URL is the single source of
 * truth so the query is shareable, survives refresh, and feeds back into the
 * server-rendered list.
 */
export function SessionsSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const debounced = useDebouncedValue(value, 300);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    const next = debounced.trim();
    if (current === next) return;

    const params = new URLSearchParams(searchParams.toString());
    if (next.length === 0) {
      params.delete("q");
    } else {
      params.set("q", next);
    }

    const qs = params.toString();
    router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname, {
      scroll: false,
    });
    // Intentionally depends on the debounced value only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <SearchInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search your sessions…"
      aria-label="Search sessions"
      onClear={() => setValue("")}
      maxLength={100}
    />
  );
}
