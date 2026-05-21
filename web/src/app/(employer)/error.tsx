"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Iter 151 — error boundary for the employer route group.
 * See /(applicant)/error.tsx for the design rationale.
 */
export default function EmployerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[EmployerError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <ErrorState
        tone="glass"
        title="Etwas ist schiefgegangen"
        description={
          process.env.NODE_ENV === "production"
            ? "Wir konnten den Employer-Bereich nicht laden. Bitte versuche es erneut."
            : `Render-Fehler: ${error.message}`
        }
        onRetry={reset}
        showDetails={process.env.NODE_ENV !== "production"}
        error={error}
      />
      {error.digest && (
        <p className="mt-3 text-center text-[11px] font-mono text-gray-400 dark:text-dark-muted">
          Ref: {error.digest}
        </p>
      )}
    </div>
  );
}
