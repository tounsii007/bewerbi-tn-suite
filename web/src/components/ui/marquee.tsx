"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — infinite horizontal (or vertical) marquee.
 *
 * Use for trust-logo strips, scrolling testimonials, news ticker. Children
 * are duplicated under the hood so the strip loops seamlessly via a single
 * `translate-x: -50%` animation.
 *
 * Pause-on-hover is on by default — good UX for clickable items.
 */
interface MarqueeProps {
  children: React.ReactNode;
  /** Speed in seconds for one full loop (default 30). Lower = faster. */
  duration?: number;
  /** Vertical scroll direction (default false = horizontal). */
  vertical?: boolean;
  /** Reverse direction. */
  reverse?: boolean;
  /** Pause animation when the cursor enters the marquee (default true). */
  pauseOnHover?: boolean;
  /** Apply gradient fade on the leading/trailing edges (default true). */
  fade?: boolean;
  className?: string;
}

export function Marquee({
  children,
  duration = 30,
  vertical = false,
  reverse = false,
  pauseOnHover = true,
  fade = true,
  className,
}: MarqueeProps) {
  // Two copies of the child set so the animation can loop seamlessly.
  // `aria-hidden` on the duplicate keeps screen readers from announcing twice.
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        vertical ? "flex-col h-full" : "w-full",
        fade && !vertical &&
          "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        fade && vertical &&
          "[mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0",
          vertical ? "flex-col" : "flex-row",
          vertical ? "animate-marquee-v" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex shrink-0",
          vertical ? "flex-col" : "flex-row",
          vertical ? "animate-marquee-v" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
    </div>
  );
}
