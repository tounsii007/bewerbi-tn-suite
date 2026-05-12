"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Thin wrapper around sonner's Toaster so the brand styling stays consistent
 * across screens and the RTL flip works for Arabic.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-white text-gray-900 border border-gray-100 shadow-[var(--shadow-lg)] rounded-xl dark:bg-dark-card dark:border-dark-border dark:text-dark-text",
          description: "text-gray-500 dark:text-dark-muted",
          actionButton: "bg-primary-500 text-white",
          cancelButton: "bg-gray-100 text-gray-700 dark:bg-dark-border dark:text-dark-text",
        },
      }}
    />
  );
}
