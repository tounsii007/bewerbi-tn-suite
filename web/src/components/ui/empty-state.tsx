import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Polite "nothing here yet" surface. Pages mount this when a query returns
 * zero rows; the pattern beats showing an empty list because it tells users
 * *why* and offers a next step.
 *
 * Iter 130 — added `tone` variant for glass surfaces (matches the rest of
 * the post-Iter-117 visual language):
 *   - `dashed` (default): light dashed border, classic empty-state look
 *   - `glass`: frosted glass surface, brand-colored icon halo, better on
 *     aurora / gradient page backgrounds
 *   - `subtle`: solid pale background, fits dense data screens
 *
 * <pre>
 * &lt;EmptyState
 *   icon={&lt;Inbox className="size-8" /&gt;}
 *   title="Noch keine Bewerbungen"
 *   description="Sobald du dich auf einen Job bewirbst, erscheint er hier."
 *   action={&lt;Button asChild&gt;&lt;Link href="/search"&gt;Stellen entdecken&lt;/Link&gt;&lt;/Button&gt;}
 *   tone="glass"
 * /&gt;
 * </pre>
 */
const containerVariants = cva(
  "flex flex-col items-center justify-center text-center animate-fade-in-up",
  {
    variants: {
      tone: {
        dashed:
          "rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 dark:border-dark-border dark:bg-dark-bg-alt/40",
        glass:
          "glass rounded-2xl shadow-[var(--shadow-md)]",
        subtle:
          "rounded-2xl bg-surface-alt dark:bg-dark-bg-alt",
      },
      compact: {
        true: "gap-2 p-6",
        false: "gap-4 p-12",
      },
    },
    defaultVariants: { tone: "dashed", compact: false },
  },
);

const iconHaloVariants = cva(
  "flex items-center justify-center rounded-2xl shrink-0",
  {
    variants: {
      tone: {
        dashed:
          "bg-white text-primary-500 ring-1 ring-gray-100 shadow-sm dark:bg-dark-card dark:ring-dark-border",
        glass:
          "bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]",
        subtle:
          "bg-primary-500/15 text-primary-600 dark:text-primary-300",
      },
      compact: {
        true: "size-10 rounded-xl",
        false: "size-16",
      },
    },
    defaultVariants: { tone: "dashed", compact: false },
  },
);

export interface EmptyStateProps
  extends VariantProps<typeof containerVariants> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone,
  compact,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(containerVariants({ tone, compact }), className)}
    >
      {icon && <span className={iconHaloVariants({ tone, compact })}>{icon}</span>}
      <div className="flex flex-col gap-1">
        <h3
          className={cn(
            "font-bold text-gray-900 dark:text-dark-text",
            compact ? "text-base" : "text-xl",
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              "text-gray-500 dark:text-dark-muted",
              compact ? "text-xs" : "text-sm max-w-sm",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
