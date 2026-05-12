"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

/**
 * Hook that fires `analytics.page(path)` on every route change. Mount once near the root —
 * inside the providers, not inside individual pages.
 *
 * Skips the very first render so SSR + hydration don't double-count the initial pageview
 * (Next reports the `LCP` metric for that already; the second event happens when the user
 * actually navigates).
 */
export function usePageTracking() {
  const pathname = usePathname();
  const search = useSearchParams();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      // Still fire once for the entry pageview but mark it as such for filtering downstream.
      analytics.page(pathname, { entry: true });
      return;
    }
    const qs = search?.toString();
    analytics.page(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, search]);
}
