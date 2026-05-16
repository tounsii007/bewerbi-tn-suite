"use client";

import { useMemo } from "react";
import { evaluatePassword } from "@shared/password-strength";
import { cn } from "@/lib/cn";
import { useTranslate } from "@/i18n/use-translate";

const BAR_COLORS: Record<number, string> = {
  0: "bg-accent-500",
  1: "bg-accent-500",
  2: "bg-amber-500",
  3: "bg-emerald-500",
  4: "bg-emerald-600",
};

/**
 * Live strength meter — runs the *same* shared evaluator the backend
 * uses, so a password that scores >= 2 client-side will also pass the
 * 422 gate. The bar is purely advisory; submission is still gated by
 * the form's own validators and the server's check.
 *
 * Strings come from the i18n dictionary so de/fr/ar all render
 * correctly when the user switches languages.
 */
export function PasswordMeter({ value }: { value: string }) {
  const t = useTranslate();
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
          {t(`auth.password.strength.${result.label}`)}
        </p>
        {result.suggestions.length > 0 && result.score < 3 && (
          <p className="text-xs text-gray-400">
            {t(`auth.password.suggest.${result.suggestions[0]}`)}
          </p>
        )}
      </div>
    </div>
  );
}
