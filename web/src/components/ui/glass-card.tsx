"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — opinionated glass card.
 *
 * Wraps the {@link Card} primitive with glass-specific affordances:
 *  - choice of glass strength (subtle / default / strong / frosted)
 *  - optional "ring-glow" halo
 *  - optional "shimmer" border (animated gradient outline)
 *  - optional "spotlight" cursor-following highlight
 *
 * Use when you want a vivid, premium feel — landing hero feature cards,
 * dashboard summary tiles, pricing cards. For dense data screens, prefer
 * the plain {@link Card} with variant="default" — glass effects are heavy
 * on the GPU and look noisy in dense grids.
 */
const glassCardVariants = cva(
  [
    "relative overflow-hidden rounded-2xl",
    "transition-[transform,box-shadow] duration-500 ease-out",
  ].join(" "),
  {
    variants: {
      strength: {
        subtle:   "glass-subtle",
        default:  "glass",
        strong:   "glass-strong",
        frosted:  "glass-frosted",
      },
      glow: {
        none:   "",
        soft:   "shadow-[0_4px_24px_oklch(0.611_0.1733_254/0.18)]",
        ring:   "ring-glow",
      },
      lift: {
        true:  "lift cursor-pointer",
        false: "",
      },
      shimmer: {
        true:  "",   // shimmer adds a sibling pseudo-element below
        false: "",
      },
    },
    defaultVariants: {
      strength: "default",
      glow: "none",
      lift: false,
      shimmer: false,
    },
  },
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  /** If true, a cursor-following highlight blob is rendered on hover. */
  spotlight?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, strength, glow, lift, shimmer, spotlight, children, onMouseMove, ...props },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    // Combine the forwarded ref with our local ref (needed for spotlight).
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
      if (spotlight && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerRef.current.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        containerRef.current.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      }
      onMouseMove?.(e);
    };

    return (
      <div
        ref={containerRef}
        className={cn(glassCardVariants({ strength, glow, lift, shimmer }), className)}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {shimmer ? (
          // Animated gradient border — sits behind the content via a
          // pseudo-mask, never affects layout.
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-2xl",
              "bg-[conic-gradient(from_180deg_at_50%_50%,var(--color-primary-500),var(--color-accent-500),var(--color-success-500),var(--color-primary-500))]",
              "opacity-60 animate-conic-spin",
              "[mask:linear-gradient(black,black)_content-box,linear-gradient(black,black)]",
              "[mask-composite:exclude] p-px",
            )}
          />
        ) : null}
        {spotlight ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(400px circle at var(--spot-x) var(--spot-y), oklch(0.611 0.1733 254 / 0.18), transparent 60%)",
            }}
          />
        ) : null}
        <div className={cn("relative z-10", spotlight && "group")}>{children}</div>
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";
