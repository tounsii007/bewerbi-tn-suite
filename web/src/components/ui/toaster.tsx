"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertCircle, Info, XCircle, Loader2 } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Branded sonner Toaster. Positions adjusts per-locale for RTL. Icons pulled from Lucide so
 * they inherit the surrounding text colour rather than sonner's pale defaults.
 *
 * Pair with the {@link toast} re-export so feature code never imports from `sonner` directly
 * — keeps the door open for swapping the underlying library later.
 */
export function Toaster() {
  // Re-render on theme change so sonner picks up the right colour scheme.
  const resolved = useThemeStore((s) => s.resolved);
  return (
    <SonnerToaster
      position="bottom-right"
      theme={resolved}
      richColors={false}
      closeButton
      gap={10}
      offset={20}
      icons={{
        success: <CheckCircle2 className="size-5 text-success-500" />,
        error: <XCircle className="size-5 text-accent-500" />,
        warning: <AlertCircle className="size-5 text-warning-500" />,
        info: <Info className="size-5 text-info-500" />,
        loading: <Loader2 className="size-5 animate-spin text-primary-500" />,
      }}
      toastOptions={{
        classNames: {
          toast: [
            "group glass-strong text-gray-900",
            "shadow-[var(--shadow-xl)] rounded-2xl",
            "dark:text-dark-text",
          ].join(" "),
          title: "font-bold text-[14px]",
          description: "text-gray-600 dark:text-dark-muted text-[13px]",
          actionButton:
            "bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:brightness-110",
          cancelButton:
            "bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold " +
            "dark:bg-dark-border dark:text-dark-text",
          // Left accent stripe per kind — wider for visual punch
          success: "before:absolute before:inset-y-3 before:start-0 before:w-1 before:rounded-r-full before:bg-[linear-gradient(180deg,var(--color-success-400),var(--color-success-600))]",
          error: "before:absolute before:inset-y-3 before:start-0 before:w-1 before:rounded-r-full before:bg-[linear-gradient(180deg,var(--color-accent-400),var(--color-accent-600))]",
          warning: "before:absolute before:inset-y-3 before:start-0 before:w-1 before:rounded-r-full before:bg-[linear-gradient(180deg,var(--color-warning-400),var(--color-warning-600))]",
          info: "before:absolute before:inset-y-3 before:start-0 before:w-1 before:rounded-r-full before:bg-[linear-gradient(180deg,var(--color-info-400),var(--color-info-600))]",
        },
      }}
    />
  );
}

export { sonnerToast as toast };
