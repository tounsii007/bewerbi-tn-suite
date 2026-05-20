"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — premium "shimmer" CTA button.
 *
 * A button with a slowly-rotating conic gradient border and an inner glow.
 * Use as the single most important call-to-action on a page — landing hero
 * "Get started", paywall primary, post-application thank-you redirect.
 *
 * Built on top of <button> / <Slot> (asChild support) so it composes with
 * next/link the same way the regular Button does.
 *
 * Avoid using more than one shimmer button per viewport — the rotating
 * conic gradient draws the eye strongly and competes with itself.
 */
interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: "md" | "lg" | "xl";
  /** When true, no shimmer — falls back to a normal styled button. */
  static?: boolean;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      asChild,
      size = "lg",
      static: isStatic = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
          "font-semibold text-white",
          "transition-transform duration-200 ease-out active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-7 text-[15px]",
          size === "xl" && "h-14 px-9 text-base",
          className,
        )}
        {...props}
      >
        {/* Rotating conic border — sits at -1px outside the inner mask. */}
        {!isStatic && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full p-[1.5px]",
              "bg-[conic-gradient(from_180deg_at_50%_50%,var(--color-primary-400),var(--color-accent-500),var(--color-warning-500),var(--color-success-500),var(--color-primary-400))]",
              "animate-conic-spin",
            )}
          />
        )}
        {/* Inner pill — dark, with the actual content */}
        <span
          className={cn(
            "relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-full",
            "bg-[linear-gradient(180deg,oklch(0.197_0.0307_263),oklch(0.262_0.0291_263))]",
            "px-[inherit]",
          )}
        >
          {children}
        </span>
        {/* Soft glow under the button on hover */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-full",
            "bg-[radial-gradient(circle_at_center,var(--color-primary-500),transparent_60%)]",
            "opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70",
          )}
        />
      </Comp>
    );
  },
);
ShimmerButton.displayName = "ShimmerButton";
