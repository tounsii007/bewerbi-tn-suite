"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — animated conic-gradient border wrapper.
 *
 * Wraps any block in a slowly-rotating multi-hue border. Use for the
 * "featured" tile in a Bento grid, the active step of a wizard, or a
 * pro-only badge. The border is masked from the inner content so it never
 * affects layout or readability.
 *
 * <AnimatedGradientBorder>
 *   <Card>...</Card>
 * </AnimatedGradientBorder>
 */
interface AnimatedGradientBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Border thickness in px (default 1.5). */
  thickness?: number;
  /** Border-radius in rem (default 1 = rounded-2xl). */
  radius?: number;
  /** Animation duration in seconds (default 8). */
  duration?: number;
}

export function AnimatedGradientBorder({
  thickness = 1.5,
  radius = 1,
  duration = 8,
  className,
  children,
  ...props
}: AnimatedGradientBorderProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ borderRadius: `${radius}rem` }}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-conic-spin"
        style={{
          padding: `${thickness}px`,
          borderRadius: `${radius}rem`,
          background:
            "conic-gradient(from 180deg at 50% 50%, var(--color-primary-500), var(--color-accent-500), var(--color-warning-500), var(--color-success-500), var(--color-info-500), var(--color-primary-500))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animationDuration: `${duration}s`,
        }}
      />
      <div
        className="relative bg-surface dark:bg-dark-card"
        style={{ borderRadius: `${radius - 0.05}rem` }}
      >
        {children}
      </div>
    </div>
  );
}
