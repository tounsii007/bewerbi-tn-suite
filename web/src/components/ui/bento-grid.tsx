"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — declarative Bento layout primitive.
 *
 * Apple-style asymmetric grid: 12 columns, auto-sized rows. Children claim
 * tiles via the {@link BentoCell} component which exposes ergonomic `span`
 * props instead of raw Tailwind class names.
 *
 * <BentoGrid>
 *   <BentoCell span={{ md: 8, lg: 6 }} rows={2}>...</BentoCell>
 *   <BentoCell span={{ md: 4, lg: 3 }}>...</BentoCell>
 * </BentoGrid>
 */
export function BentoGrid({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bento", className)} {...props}>
      {children}
    </div>
  );
}

const cellVariants = cva(
  [
    "group relative overflow-hidden rounded-2xl",
    "transition-[transform,box-shadow] duration-500 ease-out",
    "col-span-12", // mobile default — full width
  ].join(" "),
  {
    variants: {
      tone: {
        glass:
          "glass shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-xl)]",
        gradient:
          "border border-primary-100/60 bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-surface))] shadow-[var(--shadow-md)] dark:border-primary-500/20 dark:bg-[linear-gradient(135deg,oklch(0.479_0.1737_254/0.18),var(--color-dark-card))]",
        solid:
          "border border-gray-100 bg-white shadow-[var(--shadow-md)] dark:border-dark-border dark:bg-dark-card dark:shadow-none",
        accent:
          "border border-accent-200 bg-[linear-gradient(135deg,var(--color-accent-50),var(--color-surface))] shadow-[var(--shadow-md)] dark:border-accent-500/30 dark:bg-[linear-gradient(135deg,oklch(0.553_0.2074_25/0.18),var(--color-dark-card))]",
        dark:
          "border border-dark-border bg-dark-bg-alt text-dark-text shadow-[var(--shadow-md)]",
      },
      interactive: {
        true: "lift cursor-pointer",
        false: "",
      },
      glow: {
        none: "",
        soft: "shadow-[0_4px_24px_oklch(0.611_0.1733_254/0.18)]",
        ring: "ring-glow",
      },
    },
    defaultVariants: {
      tone: "glass",
      interactive: false,
      glow: "none",
    },
  },
);

type SpanBreakpoints = {
  /** Mobile (default) span — 1..12. Omit to use the cell's default (12). */
  base?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Tablet (md) span — 1..12. */
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Desktop (lg) span — 1..12. */
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

export interface BentoCellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cellVariants> {
  /** Column span at each breakpoint. */
  span?: SpanBreakpoints;
  /** Row span — most cells should be 1; feature cells 2. */
  rows?: 1 | 2 | 3;
}

const baseSpanMap = {
  1: "col-span-1",  2: "col-span-2",  3: "col-span-3",  4: "col-span-4",
  5: "col-span-5",  6: "col-span-6",  7: "col-span-7",  8: "col-span-8",
  9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
} as const;

const mdSpanMap = {
  1: "md:col-span-1",  2: "md:col-span-2",  3: "md:col-span-3",  4: "md:col-span-4",
  5: "md:col-span-5",  6: "md:col-span-6",  7: "md:col-span-7",  8: "md:col-span-8",
  9: "md:col-span-9", 10: "md:col-span-10", 11: "md:col-span-11", 12: "md:col-span-12",
} as const;

const lgSpanMap = {
  1: "lg:col-span-1",  2: "lg:col-span-2",  3: "lg:col-span-3",  4: "lg:col-span-4",
  5: "lg:col-span-5",  6: "lg:col-span-6",  7: "lg:col-span-7",  8: "lg:col-span-8",
  9: "lg:col-span-9", 10: "lg:col-span-10", 11: "lg:col-span-11", 12: "lg:col-span-12",
} as const;

const rowMap = { 1: "", 2: "row-span-2", 3: "row-span-3" } as const;

export const BentoCell = React.forwardRef<HTMLDivElement, BentoCellProps>(
  (
    { className, tone, interactive, glow, span, rows = 1, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        cellVariants({ tone, interactive, glow }),
        span?.base ? baseSpanMap[span.base] : null,
        span?.md ? mdSpanMap[span.md] : null,
        span?.lg ? lgSpanMap[span.lg] : null,
        rowMap[rows],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
BentoCell.displayName = "BentoCell";
