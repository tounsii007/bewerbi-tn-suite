import { useCallback, useEffect, useRef } from "react";

/**
 * Stable debounced wrapper around a callback. Use when you need to delay a side-effect (analytics
 * ping, server search) and a debounced *value* — see {@code useDebouncedValue} — isn't enough.
 *
 * The returned function cancels any pending fire on dependency change or unmount.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Use a ref so the latest fn closure is always called without recreating the debounced fn.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: TArgs) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  );
}
