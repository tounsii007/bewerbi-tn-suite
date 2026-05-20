"use client";

import * as React from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — animated number counter that triggers when scrolled into view.
 *
 * Uses framer-motion spring physics so the count "settles" instead of doing
 * a linear ramp. Perfect for dashboard hero stats:
 *   <NumberTicker value={1284} suffix="+" />
 *   <NumberTicker value={98} suffix="%" />
 *
 * - Plays once per page load (IntersectionObserver, `once: true`).
 * - Locale-aware formatting (`Intl.NumberFormat`).
 * - `prefers-reduced-motion`: framer's `useSpring` is gated by the global
 *   `<MotionConfig reducedMotion="user">` we should add to providers in a
 *   follow-up iteration. For now the spring still animates but very fast.
 */
interface NumberTickerProps {
  value: number;
  /** Number formatting locale (default "de-DE"). */
  locale?: string;
  /** Decimal places to display (default 0). */
  decimals?: number;
  /** Spring stiffness (higher = snappier). Default 60. */
  stiffness?: number;
  /** Spring damping (higher = less oscillation). Default 25. */
  damping?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function NumberTicker({
  value,
  locale = "de-DE",
  decimals = 0,
  stiffness = 60,
  damping = 25,
  prefix = "",
  suffix = "",
  className,
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness, damping });
  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  React.useEffect(() => {
    const fmt = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const unsub = spring.on("change", (current) => {
      setDisplay(fmt.format(current));
    });
    return unsub;
  }, [spring, locale, decimals]);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
