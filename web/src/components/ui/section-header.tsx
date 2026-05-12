import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Consistent page/section header — title + optional eyebrow + description + slot for actions
 * on the right. Used by Dashboard, Search, Profile, Applications…
 *
 * <pre>
 * &lt;SectionHeader
 *   eyebrow="Übersicht"
 *   title="Deine Bewerbungen"
 *   description="Verfolge den Status aller laufenden Anträge."
 *   actions={&lt;Button&gt;Neu&lt;/Button&gt;}
 * /&gt;
 * </pre>
 */
export interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  /** When true the title uses the brand gradient (hero pages only). */
  gradient?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  gradient = false,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
            {eyebrow}
          </span>
        )}
        <h1
          className={cn(
            "text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl",
            "dark:text-dark-text",
            gradient && "text-gradient",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-prose text-sm text-gray-500 dark:text-dark-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
