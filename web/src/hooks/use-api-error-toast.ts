"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslate } from "@/i18n/use-translate";
import { apiErrorMessage } from "@/lib/api-errors";

/**
 * Drop-in replacement for the common
 * {@code toast.error((e as Error).message)} pattern: runs the error
 * through {@link apiErrorMessage} so backend `messageKey`s are
 * translated through the active locale before they hit the user.
 *
 * @example
 *   const toastApiError = useApiErrorToast();
 *   try { await api... } catch (e) { toastApiError(e, "Speichern fehlgeschlagen"); }
 */
export function useApiErrorToast() {
  const t = useTranslate();
  return useCallback(
    (err: unknown, fallback: string) => {
      toast.error(apiErrorMessage(t, err, fallback));
    },
    [t],
  );
}
