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
            "group bg-white text-gray-900 border border-gray-100",
            "shadow-[var(--shadow-lg)] rounded-2xl backdrop-blur",
            "dark:bg-dark-card/95 dark:border-dark-border dark:text-dark-text",
          ].join(" "),
          title: "font-semibold text-[14px]",
          description: "text-gray-500 dark:text-dark-muted text-[13px]",
          actionButton:
            "bg-primary-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-primary-600",
          cancelButton:
            "bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold " +
            "dark:bg-dark-border dark:text-dark-text",
          success: "border-l-4 border-l-success-500",
          error: "border-l-4 border-l-accent-500",
          warning: "border-l-4 border-l-warning-500",
          info: "border-l-4 border-l-info-500",
        },
      }}
    />
  );
}

export { sonnerToast as toast };
