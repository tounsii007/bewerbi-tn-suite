"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — animated gradient text.
 *
 * For hero headlines and standout numbers. The gradient slowly cycles via
 * background-position animation; respects prefers-reduced-motion (the
 * `animate-border-flow` utility is globally gated by the reduced-motion
 * media query).
 *
 * Variants:
 *  - `brand` — primary → violet → primary (default)
 *  - `aurora` — multi-stop conic with all brand hues
 *  - `sunrise` — accent (red/orange) → warning (gold)
 *  - `flame` — accent → primary (warm-to-cool, very lively)
 */
type Variant = "brand" | "aurora" | "sunrise" | "flame";

const gradientFor: Record<Variant, string> = {
  brand:
    "bg-[linear-gradient(120deg,var(--color-primary-500),oklch(0.611_0.18_280),var(--color-primary-500))]",
  aurora:
    "text-gradient-conic",
  sunrise:
    "bg-[linear-gradient(120deg,var(--color-accent-500),var(--color-warning-500),var(--color-accent-500))]",
  flame:
    "bg-[linear-gradient(120deg,var(--color-accent-500),oklch(0.711_0.18_320),var(--color-primary-500))]",
};

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  /** If true, animates the gradient position (default). */
  animate?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

export function GradientText({
  variant = "brand",
  animate = true,
  as: Tag = "span",
  className,
  children,
  ...props
}: GradientTextProps) {
  // We can't typecheck `as` precisely without generics; this is a documented
  // escape hatch.  Casting is safe because we always render an intrinsic.
  const Component = Tag as React.ElementType;
  const usesUtility = variant === "aurora";
  return (
    <Component
      className={cn(
        "inline-block",
        usesUtility ? gradientFor[variant] : "bg-clip-text text-transparent",
        !usesUtility && gradientFor[variant],
        animate && "animate-border-flow",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
