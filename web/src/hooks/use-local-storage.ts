"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * SSR-safe persisted state. Reads on mount (never during SSR), writes on every change. Useful
 * for UI preferences that don't merit a Zustand store (e.g. filter chip collapse state).
 *
 * Storage is JSON-encoded; failure falls back to {@code initial} and logs to console.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useLocalStorage:", e);
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useLocalStorage:", e);
    }
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return [value, setValue, { hydrated, reset }] as const;
}
