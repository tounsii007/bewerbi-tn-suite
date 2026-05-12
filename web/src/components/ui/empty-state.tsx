import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Polite "nothing here yet" surface. Pages mount this when a query returns zero rows; the
 * pattern beats showing an empty list because it tells users *why* and offers a next step.
 *
 * <pre>
 * &lt;EmptyState
 *   icon={&lt;Inbox className="size-8" /&gt;}
 *   title="Noch keine Bewerbungen"
 *   description="Sobald du dich auf einen Job bewirbst, erscheint er hier."
 *   action={&lt;Button asChild&gt;&lt;Link href="/search"&gt;Stellen entdecken&lt;/Link&gt;&lt;/Button&gt;}
 * /&gt;
 * </pre>
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Compact variant — used in card-sized empty states (saved searches, etc). */
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 p-6" : "gap-4 p-12",
        "rounded-2xl border border-dashed border-gray-200 bg-gray-50/50",
        "dark:border-dark-border dark:bg-dark-bg-alt/40",
        "animate-fade-in-up",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex items-center justify-center rounded-full",
            "bg-white text-primary-500 ring-1 ring-gray-100 shadow-sm",
            "dark:bg-dark-card dark:ring-dark-border",
            compact ? "size-10" : "size-14",
          )}
        >
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className={cn("font-bold text-gray-900 dark:text-dark-text",
          compact ? "text-base" : "text-lg")}>
          {title}
        </h3>
        {description && (
          <p className={cn("text-gray-500 dark:text-dark-muted",
            compact ? "text-xs" : "text-sm max-w-sm")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
