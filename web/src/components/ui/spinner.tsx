import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-7",
      xl: "size-10",
    },
    tone: {
      current: "text-current",
      primary: "text-primary-500",
      muted: "text-gray-400 dark:text-dark-muted",
    },
  },
  defaultVariants: { size: "md", tone: "current" },
});

export interface SpinnerProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "size">,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label. Defaults to "Loading". */
  label?: string;
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, tone, label = "Loading", ...props }, ref) => (
    <svg
      ref={ref}
      role="status"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(spinnerVariants({ size, tone, className }))}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
);
Spinner.displayName = "Spinner";
