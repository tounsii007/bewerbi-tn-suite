"use client";

import * as React from "react";

/**
 * ARIA live-region. Mount once in the root layout, then call {@link useAnnounce} from anywhere
 * to send a short message to screen readers (e.g. "Suche aktualisiert: 12 Treffer"). Polite by
 * default; pass {@code assertive} for genuine alerts.
 *
 * Why this and not toasts? Toasts are visual; not every announcement should pop a UI. Use this
 * for state changes that are obvious to sighted users but invisible otherwise.
 */
const LiveRegionContext = React.createContext<((msg: string, assertive?: boolean) => void) | null>(
  null,
);

export function useAnnounce() {
  const ctx = React.useContext(LiveRegionContext);
  if (!ctx) {
    // Don't throw — failing silently is the right call here; missing context shouldn't
    // break the page. Log once in dev.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("useAnnounce() outside <LiveRegionProvider>");
    }
    return () => {};
  }
  return ctx;
}

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [polite, setPolite] = React.useState("");
  const [assertive, setAssertive] = React.useState("");

  const announce = React.useCallback((msg: string, isAssertive = false) => {
    // Clear first so identical consecutive messages still re-announce.
    if (isAssertive) {
      setAssertive("");
      requestAnimationFrame(() => setAssertive(msg));
    } else {
      setPolite("");
      requestAnimationFrame(() => setPolite(msg));
    }
  }, []);

  return (
    <LiveRegionContext.Provider value={announce}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {polite}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {assertive}
      </div>
    </LiveRegionContext.Provider>
  );
}
