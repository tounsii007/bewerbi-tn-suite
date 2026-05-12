import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted",
        info:
          "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
        success:
          "bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-500",
        warning:
          "bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
        error:
          "bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-500",
        outline:
          "border border-gray-200 text-gray-700 dark:border-dark-border dark:text-dark-text",
        // Subtle "premium" look — uses primary tone but with a thin ring.
        premium:
          "bg-[linear-gradient(135deg,var(--color-primary-50),oklch(0.937_0.0322_280))] text-primary-700 ring-1 ring-primary-200/60 dark:bg-primary-500/15 dark:text-primary-200 dark:ring-primary-500/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      dot: {
        true: "pl-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      dot: false,
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Render a coloured dot before the label (for status indicators). */
  withDot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  withDot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, dot: withDot, className }))}
      {...props}
    >
      {withDot && (
        <span className="inline-block size-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}
