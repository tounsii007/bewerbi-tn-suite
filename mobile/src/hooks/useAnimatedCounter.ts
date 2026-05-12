import { useEffect, useRef, useState } from "react";

/**
 * Eases a number from its previous value to the new target over `duration` ms.
 * Uses requestAnimationFrame on web and native; falls back to the final value
 * if rAF is unavailable.
 */
export function useAnimatedCounter(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const previous = useRef(target);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const raf =
      typeof globalThis.requestAnimationFrame === "function"
        ? globalThis.requestAnimationFrame
        : null;
    if (!raf) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const from = previous.current;
    const delta = target - from;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + delta * eased);
      if (t < 1) frame.current = raf(step);
      else previous.current = target;
    };

    frame.current = raf(step);
    return () => {
      if (frame.current != null && typeof globalThis.cancelAnimationFrame === "function") {
        globalThis.cancelAnimationFrame(frame.current);
      }
    };
  }, [target, duration]);

  return value;
}
