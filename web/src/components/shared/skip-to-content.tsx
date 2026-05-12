"use client";

import { cn } from "@/lib/cn";

/**
 * "Skip to main content" link — first focusable element on the page. Stays visually hidden until
 * a keyboard user tabs to it, then pops into view in the top-left. WCAG 2.4.1.
 *
 * Pair with a `<main id="main">` element in the layout — see `app-shell.tsx`.
 */
export function SkipToContent({ targetId = "main" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:left-4 focus:top-4 focus:z-[100]",
        "focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2",
        "focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      )}
    >
      Zum Hauptinhalt springen
    </a>
  );
}
