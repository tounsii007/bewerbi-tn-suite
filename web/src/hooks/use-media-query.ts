"use client";

import { useEffect, useState } from "react";

/**
 * Reactive media-query hook. Returns the initial value synchronously on the client (matters
 * for layouts that branch on viewport size — avoids flicker on the first paint).
 *
 * Use for layout decisions; for visual changes prefer Tailwind responsive classes since they
 * don't require JS to ship correctly.
 */
export function useMediaQuery(query: string): boolean {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Common breakpoints aligned with Tailwind defaults. */
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
} as const;

export const useIsMobile = () => !useMediaQuery(breakpoints.md);
