import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva(
  "rounded-2xl",
  {
    variants: {
      variant: {
        default:
          "border border-gray-100 bg-white shadow-[var(--shadow-md)] dark:border-dark-border dark:bg-dark-card dark:shadow-none",
        elevated:
          "border border-gray-100 bg-white shadow-[var(--shadow-lg)] dark:border-dark-border dark:bg-dark-card",
        flat:
          "border border-gray-100 bg-white dark:border-dark-border dark:bg-dark-card",
        glass:
          "glass shadow-[var(--shadow-md)]",
        ghost:
          "bg-gray-50 dark:bg-dark-bg-alt",
        outline:
          "border border-gray-200 bg-transparent dark:border-dark-border",
        accent:
          "border border-primary-200 bg-primary-50/60 dark:border-primary-500/30 dark:bg-primary-500/10",
        gradient:
          "border border-primary-100/60 bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-surface))] dark:border-primary-500/20 dark:bg-[linear-gradient(135deg,oklch(0.479_0.1737_254/0.18),var(--color-dark-card))]",
      },
      interactive: {
        true: "lift cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 p-5 pb-3", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-bold tracking-tight text-gray-900 dark:text-dark-text",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-dark-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { cardVariants };
