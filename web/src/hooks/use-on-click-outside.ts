"use client";

import { useEffect, type RefObject } from "react";

/**
 * Fires the handler when a pointer-down lands outside the given element. Used by ad-hoc
 * dropdowns, filter panels, and inline editors — Radix primitives already handle this
 * themselves.
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  /** Disable temporarily without removing the hook (e.g. during a confirmation modal). */
  active: boolean = true,
) {
  useEffect(() => {
    if (!active) return;
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, active]);
}
