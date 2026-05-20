"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — premium "shimmer" CTA.
 *
 * Renders a button (or a Next.js Link when `href` is provided) with a slowly
 * rotating conic gradient border and an inner glow. Use as the single most
 * important call-to-action on a page — landing hero "Get started", paywall
 * primary, post-application thank-you redirect.
 *
 * Avoid using more than one shimmer button per viewport — the rotating
 * conic gradient draws the eye strongly and competes with itself.
 *
 * NOTE: This component does NOT support Radix's `asChild` pattern because
 * the decorative gradient layers must be siblings to the content (not
 * children of a single Slot). Use `href` for navigation, `onClick` for
 * actions.
 */
type ShimmerSize = "md" | "lg" | "xl";

type BaseProps = {
  size?: ShimmerSize;
  /** Disable the rotating border (falls back to a static premium button). */
  static?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonModeProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type LinkModeProps = BaseProps &
  Omit<React.ComponentProps<typeof Link>, keyof BaseProps | "href"> & {
    href: React.ComponentProps<typeof Link>["href"];
  };

type ShimmerButtonProps = ButtonModeProps | LinkModeProps;

const sizeClasses: Record<ShimmerSize, string> = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
  xl: "h-14 px-9 text-base",
};

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ShimmerButtonProps
>(
  (
    {
      size = "lg",
      static: isStatic = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isLink = "href" in rest && rest.href !== undefined;

    const wrapperClasses = cn(
      "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
      "font-semibold text-white",
      "transition-transform duration-200 ease-out active:scale-[0.97]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      sizeClasses[size],
      className,
    );

    const decorations = (
      <>
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
      </>
    );

    if (isLink) {
      const { href, ...linkRest } = rest as LinkModeProps;
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={wrapperClasses}
          {...linkRest}
        >
          {decorations}
        </Link>
      );
    }

    const buttonRest = rest as ButtonModeProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={wrapperClasses}
        {...buttonRest}
      >
        {decorations}
      </button>
    );
  },
);
ShimmerButton.displayName = "ShimmerButton";
