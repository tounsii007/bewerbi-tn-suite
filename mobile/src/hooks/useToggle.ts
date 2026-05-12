import { useCallback, useState } from "react";

/**
 * Boolean state with a stable toggle handler. Light wrapper but it removes the temptation to
 * write {@code () => set(v => !v)} inline (which breaks referential equality and triggers
 * unnecessary re-renders downstream).
 */
export function useToggle(initial = false): readonly [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
}
