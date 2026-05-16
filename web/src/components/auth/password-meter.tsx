"use client";

import { useMemo } from "react";
import { evaluatePassword } from "@shared/password-strength";
import { cn } from "@/lib/cn";

const SUGGESTION_DE: Record<string, string> = {
  length: "Mindestens 8 Zeichen.",
  mixClasses: "Mische Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen.",
  noSequential: 'Keine Folgen wie "abc" oder "123".',
  noRepeats: "Vermeide drei gleiche Zeichen hintereinander.",
  notCommon: "Dieses Passwort ist zu weit verbreitet.",
};

const BAR_COLORS: Record<number, string> = {
  0: "bg-accent-500",
  1: "bg-accent-500",
  2: "bg-amber-500",
  3: "bg-emerald-500",
  4: "bg-emerald-600",
};

const LABEL_DE: Record<string, string> = {
  "very-weak": "Sehr schwach",
  weak: "Schwach",
  fair: "Mittel",
  strong: "Stark",
  "very-strong": "Sehr stark",
};

/**
 * Live strength meter — runs the *same* shared evaluator the backend
 * uses, so a password that scores >= 2 client-side will also pass the
 * 422 gate. The bar is purely advisory; submission is still gated by
 * the form's own validators and the server's check.
 */
export function PasswordMeter({ value }: { value: string }) {
  const result = useMemo(() => evaluatePassword(value), [value]);
  if (!value) return null;

  return (
    <div className="mt-1 space-y-1">
      <div className="flex h-1.5 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-full flex-1 rounded-full bg-gray-200 dark:bg-dark-border transition-colors",
              i < result.score && BAR_COLORS[result.score],
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 dark:text-dark-muted">
          {LABEL_DE[result.label]}
        </p>
        {result.suggestions.length > 0 && result.score < 3 && (
          <p className="text-xs text-gray-400">
            {SUGGESTION_DE[result.suggestions[0]] ?? ""}
          </p>
        )}
      </div>
    </div>
  );
}
