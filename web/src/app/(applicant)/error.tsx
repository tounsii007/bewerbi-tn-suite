"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Iter 151 — error boundary for the applicant route group.
 *
 * Next.js renders this when any page or component below
 * /(applicant)/* throws during render. The AppShell layout is preserved
 * (nav stays visible) so the user can recover by clicking a different
 * tab or hitting "Erneut versuchen".
 */
export default function ApplicantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[ApplicantError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <ErrorState
        tone="glass"
        title="Etwas ist schiefgegangen"
        description={
          process.env.NODE_ENV === "production"
            ? "Wir konnten die Seite nicht laden. Versuche es in einem Moment erneut."
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
