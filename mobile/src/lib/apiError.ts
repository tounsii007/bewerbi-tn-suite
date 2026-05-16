import i18n from "../i18n";
import type { ApiError } from "./apiClient";

/**
 * Translate an error thrown by the apiClient through the active locale.
 * Mirrors web/src/lib/api-errors.ts:
 * - prefers the first field violation's messageKey
 * - falls back to the top-level messageKey
 * - falls back to the raw `message`, finally to `fallback`.
 *
 * Use from any try/catch in screens / hooks:
 *
 *   try { await ... }
 *   catch (e) { Alert.alert(t('common.error'), apiErrorMessage(e, 'Aktion fehlgeschlagen')); }
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;
  const e = err as Partial<ApiError> & { message?: string };

  const first = e.violations?.[0];
  if (first?.messageKey) {
    const translated = i18n.t(first.messageKey);
    if (translated && translated !== first.messageKey) return translated;
  }
  if (e.messageKey) {
    const translated = i18n.t(e.messageKey);
    if (translated && translated !== e.messageKey) return translated;
  }
  return e.message?.trim() || fallback;
}
