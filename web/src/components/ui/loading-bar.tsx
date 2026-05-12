"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Indeterminate top-of-page loading bar. Same UX language as YouTube / GitHub's PJAX bars.
 * Mount once near the root, drive via {@code <LoadingBar active={pending} />} or the helper
 * hook below.
 *
 * Stays out of the DOM when inactive to keep the layout pristine. Animation is GPU-only
 * (transform) and respects reduced-motion via the global media query.
 */
export interface LoadingBarProps {
  active: boolean;
  className?: string;
}

export function LoadingBar({ active, className }: LoadingBarProps) {
  // Mount with a tiny delay to avoid flashing the bar on instant transitions.
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), 80);
    return () => clearTimeout(t);
  }, [active]);

  if (!shown) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className={cn(
        "fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden",
        "bg-primary-500/10",
        className,
      )}
    >
      <div
        className="h-full w-full origin-left bg-[linear-gradient(90deg,transparent,var(--color-primary-500),transparent)]"
        style={{ animation: "loading-bar 1.2s var(--ease-out-quad) infinite" }}
      />
    </div>
  );
}
