"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Inline "something went wrong" panel. Two use-cases:
 *  - query failures (pass {@code error} and {@code onRetry})
 *  - hard runtime errors (use {@link ErrorBoundary} below, which renders this as fallback)
 *
 * Keeps the visual language consistent: warning surface, clear title, optional retry.
 * Don't dump stack traces here in prod — they leak internals and confuse users.
 */
export interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  /** When true (dev only), shows the error message and stack below the description. */
  showDetails?: boolean;
}

export function ErrorState({
  title = "Etwas ist schiefgegangen",
  description = "Wir konnten die Daten nicht laden. Bitte versuche es in einem Moment erneut.",
  error,
  onRetry,
  retryLabel = "Erneut versuchen",
  showDetails = false,
  className,
}: ErrorStateProps) {
  const msg = error instanceof Error ? error.message : error ? String(error) : null;
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl p-10 text-center",
        "border border-accent-100 bg-accent-50/40",
        "dark:border-accent-500/30 dark:bg-accent-500/10",
        "animate-fade-in-up",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h3 className="text-lg font-bold text-accent-700 dark:text-accent-300">{title}</h3>
        <p className="text-sm text-accent-700/80 dark:text-accent-200/70">{description}</p>
        {showDetails && msg && (
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-white/60 p-2 text-left text-[11px] text-accent-900 dark:bg-dark-card/60 dark:text-accent-200">
            {msg}
          </pre>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} leadingIcon={<RefreshCw className="size-4" />}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Simple React error boundary that renders {@link ErrorState}. Wrap the application shell or
 * individual route segments with this. For richer behaviour (logging to Sentry, scoped resets)
 * extend the {@code componentDidCatch} hook.
 */
interface BoundaryProps {
  children: React.ReactNode;
  fallback?: (err: Error, reset: () => void) => React.ReactNode;
}
interface BoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !== "undefined") {
      // Don't crash silently; the audit log will pick this up in services that ship it.
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  override render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
      return (
        <ErrorState
          error={this.state.error}
          onRetry={this.reset}
          showDetails={process.env.NODE_ENV !== "production"}
        />
      );
    }
    return this.props.children;
  }
}
