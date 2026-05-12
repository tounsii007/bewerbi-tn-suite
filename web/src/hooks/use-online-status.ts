"use client";

import { useEffect, useState } from "react";

/**
 * Reactive online/offline flag. Backed by `navigator.onLine` + the `online`/`offline` window
 * events. Use to show an offline banner or to short-circuit network actions.
 *
 * Note: `navigator.onLine` reports the local connection state, not whether your specific
 * backend is reachable — pair with a periodic ping if you need server-reachability.
 */
export function useOnlineStatus(): boolean {
  const get = () => (typeof navigator !== "undefined" ? navigator.onLine : true);
  const [online, setOnline] = useState<boolean>(get);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
