import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold",
    "transition-[transform,background,color,box-shadow] duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    "active:scale-[0.97]",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700",
        gradient:
          "text-white shadow-md bg-[linear-gradient(135deg,var(--color-primary-500)_0%,oklch(0.611_0.18_280)_100%)] hover:brightness-110 hover:shadow-lg",
        outline:
          "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-dark-bg",
        ghost:
          "text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-bg",
        destructive:
          "bg-accent-500 text-white shadow-sm hover:bg-accent-600 active:bg-accent-700",
        subtle:
          "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-500/15 dark:text-primary-300",
        link:
          "text-primary-500 underline-offset-4 hover:underline active:scale-100",
        glass:
          "glass text-gray-900 dark:text-dark-text hover:bg-white/80 dark:hover:bg-dark-card/80",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-14 px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Renders a spinner and disables the button while true. */
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      block,
      asChild = false,
      loading = false,
      disabled,
      children,
      leadingIcon,
      trailingIcon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    // Radix' Slot requires exactly one React element child. When
    // asChild=true we forward children as-is; the caller is responsible
    // for putting any icon inside their <Link>/<a>.
    if (asChild) {
      return (
        <Comp
          ref={ref}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled}
          className={cn(buttonVariants({ variant, size, block, className }))}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    return (
      <Comp
        ref={ref}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, block, className }))}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center">
            <Spinner className="size-4" />
          </span>
        ) : leadingIcon}
        {children}
        {!loading && trailingIcon}
      </Comp>
    );
  },
);
Button.displayName = "Button";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { buttonVariants };
