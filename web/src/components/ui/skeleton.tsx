import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Loading placeholder.
 *
 * - `shimmer` (default): traveling-light gradient. Use for content-heavy
 *   areas (cards, lists).
 * - `pulse-soft`: gentle opacity pulse. Use for short text lines where
 *   shimmer would feel busy.
 * - `glass`: frosted shimmer that matches Iter 117 glass cards.
 *
 * The {@link SkeletonGroup} helper makes equal-width text-line stacks
 * trivial.
 */
const skeletonVariants = cva(
  "block rounded-md overflow-hidden relative",
  {
    variants: {
      tone: {
        default: "bg-gray-100 dark:bg-dark-bg-alt",
        glass: "bg-white/40 dark:bg-dark-card/40 backdrop-blur-sm",
      },
      shimmer: {
        true: [
          "before:absolute before:inset-0",
          "before:bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.55),transparent)]",
          "before:animate-shimmer",
          "dark:before:bg-[linear-gradient(90deg,transparent,oklch(0.331_0.0292_263/0.6),transparent)]",
        ].join(" "),
        false: "animate-pulse-soft",
      },
      shape: {
        rect: "rounded-md",
        rounded: "rounded-xl",
        pill: "rounded-full",
        circle: "rounded-full aspect-square",
      },
    },
    defaultVariants: { tone: "default", shimmer: true, shape: "rect" },
  },
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ className, tone, shimmer, shape, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      className={cn(skeletonVariants({ tone, shimmer, shape, className }))}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export interface SkeletonGroupProps {
  lines: number;
  className?: string;
  lineWidth?: string;
  lastWidth?: string;
  lineHeight?: string;
  gap?: string;
}

export function SkeletonGroup({
  lines,
  className,
  lineWidth = "100%",
  lastWidth = "62%",
  lineHeight = "0.85rem",
  gap = "0.5rem",
}: SkeletonGroupProps) {
  return (
    <div className={cn("flex flex-col", className)} style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          style={{
            width: i === lines - 1 ? lastWidth : lineWidth,
            height: lineHeight,
          }}
        />
      ))}
    </div>
  );
}
