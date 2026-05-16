import type { ApiError } from "./types";

/**
 * Translate an error thrown by api-client through the active locale
 * dictionary. The backend stamps every domain error with a stable
 * {@code messageKey} (Iter 30 added the
 * `error.auth.password.weak.<id>` family); we use that key first and
 * only fall back to the raw {@code message} if the dictionary has no
 * translation for it.
 *
 * Pass the {@link useTranslate} return value as the first argument so
 * the helper itself stays pure and Server-Component-safe.
 *
 * @example
 *   const t = useTranslate();
 *   try { await api... }
 *   catch (e) { toast.error(apiErrorMessage(t, e, "Login fehlgeschlagen")); }
 */
export function apiErrorMessage(
  t: (key: string, vars?: Record<string, string | number>, fallback?: string) => string,
  err: unknown,
  fallback: string,
): string {
  if (!err || typeof err !== "object") return fallback;
  const e = err as Partial<ApiError> & { message?: string };

  // Per-field violations get their *first* entry surfaced; the others
  // sit in `violations` for the form layer to highlight inline.
  const first = e.violations?.[0];
  if (first?.messageKey) {
    const translated = t(first.messageKey, {}, first.message ?? fallback);
    if (translated && translated !== first.messageKey) return translated;
  }

  if (e.messageKey) {
    const translated = t(e.messageKey, {}, e.message ?? fallback);
    if (translated && translated !== e.messageKey) return translated;
  }

  return e.message?.trim() || fallback;
}
