"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * One-shot clipboard hook with success/error state and a self-resetting "copied" flag.
 *
 * <pre>
 * const { copy, copied } = useCopyToClipboard();
 * &lt;Button onClick={() =&gt; copy(token)}&gt;
 *   {copied ? "Kopiert!" : "Token kopieren"}
 * &lt;/Button&gt;
 * </pre>
 */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Legacy fallback for non-secure contexts.
          const el = document.createElement("textarea");
          el.value = text;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          el.remove();
        }
        setCopied(true);
        setError(null);
        timer.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch (e) {
        setError(e);
        setCopied(false);
        return false;
      }
    },
    [resetMs],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { copy, copied, error };
}
