import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Inline, page-anchored notice — distinct from toasts which are transient. Use the variant
 * to encode severity; the icon is set automatically but can be overridden.
 *
 * Default density is medium; pass {@code compact} for table-row notices.
 */
const alertVariants = cva(
  "flex items-start gap-3 rounded-xl border p-4 text-sm",
  {
    variants: {
      variant: {
        info:
          "border-info-100 bg-info-100/40 text-info-600 dark:border-info-500/30 dark:bg-info-500/10 dark:text-info-500",
        success:
          "border-success-100 bg-success-100/40 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-500",
        warning:
          "border-warning-100 bg-warning-100/40 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-500",
        error:
          "border-accent-100 bg-accent-50/60 text-accent-700 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-500",
        neutral:
          "border-gray-200 bg-gray-50 text-gray-700 dark:border-dark-border dark:bg-dark-bg-alt dark:text-dark-text",
      },
      compact: {
        true: "p-2 text-xs",
        false: "",
      },
    },
    defaultVariants: { variant: "info", compact: false },
  },
);

const DEFAULT_ICONS: Record<
  NonNullable<VariantProps<typeof alertVariants>["variant"]>,
  React.ComponentType<{ className?: string }>
> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  neutral: AlertCircle,
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function Alert({
  className,
  variant = "info",
  compact,
  title,
  icon,
  action,
  children,
  ...props
}: AlertProps) {
  const DefaultIcon = DEFAULT_ICONS[variant ?? "info"];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(alertVariants({ variant, compact, className }))}
      {...props}
    >
      <span className="mt-0.5 shrink-0">
        {icon ?? <DefaultIcon className="size-5" aria-hidden />}
      </span>
      <div className="flex-1">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && <div className={cn(title && "mt-1", "leading-snug")}>{children}</div>}
      </div>
      {action && <div className="ml-2 shrink-0">{action}</div>}
    </div>
  );
}
