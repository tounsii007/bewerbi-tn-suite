import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Loading placeholder. Use a shimmer for content-heavy areas (cards, lists) and a soft pulse
 * for short text lines. The {@code SkeletonGroup} helper makes equal-width text-line stacks
 * trivial — pass {@code lines} and an optional {@code lastWidth}.
 */
const skeletonVariants = cva(
  "block rounded-md bg-gray-100 dark:bg-dark-bg-alt overflow-hidden relative",
  {
    variants: {
      shimmer: {
        true: [
          "before:absolute before:inset-0",
          "before:bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.55),transparent)]",
          "before:animate-shimmer",
          "dark:before:bg-[linear-gradient(90deg,transparent,oklch(0.331_0.0292_263/0.6),transparent)]",
        ].join(" "),
        false: "animate-pulse-soft",
      },
    },
    defaultVariants: { shimmer: true },
  },
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ className, shimmer, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      className={cn(skeletonVariants({ shimmer, className }))}
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
