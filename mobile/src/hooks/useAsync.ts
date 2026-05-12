import { useCallback, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
}

/**
 * One-shot wrapper around an async function. Tracks {@code loading/error/data}, prevents stale
 * updates when the component unmounts mid-flight, and returns a stable {@code run} reference.
 *
 * Not a replacement for TanStack Query — use for screen-local interactions like submitting a
 * form or running an imperative refresh.
 */
export function useAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    error: null,
    loading: false,
  });
  // Track an increasing call id so a slow previous call doesn't clobber a fast newer one.
  const counter = useRef(0);

  const run = useCallback(
    async (...args: TArgs) => {
      const id = ++counter.current;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fn(...args);
        if (id === counter.current) {
          setState({ data, error: null, loading: false });
        }
        return data;
      } catch (error) {
        if (id === counter.current) {
          setState({ data: null, error, loading: false });
        }
        throw error;
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    counter.current++;
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, run, reset };
}
