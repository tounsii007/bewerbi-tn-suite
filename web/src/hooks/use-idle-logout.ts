"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";

const IDLE_MS = 20 * 60 * 1000; // 20 min
const WARN_BEFORE_MS = 60 * 1000; // 60 s warning

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "visibilitychange",
] as const;

/**
 * Sign the user out after {@link IDLE_MS} of inactivity, with a 60-second
 * warning toast. Mounted once from the root provider. Behaviour:
 *
 * - Tabs that share the same browser sync activity via storage events so
 *   one active tab keeps the others alive.
 * - A returning {@code visibilitychange} counts as activity; an `hidden`
 *   one does not reset the timer.
 * - No-op when no session is present, so it costs nothing on /login.
 */
export function useIdleLogout() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    const reschedule = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);

      warnTimerRef.current = setTimeout(() => {
        toast.warning(
          "Du wirst in 1 Minute aus Sicherheitsgründen abgemeldet. Bewege die Maus, um angemeldet zu bleiben.",
          { duration: WARN_BEFORE_MS, id: "idle-warning" },
        );
      }, IDLE_MS - WARN_BEFORE_MS);

      logoutTimerRef.current = setTimeout(() => {
        toast.dismiss("idle-warning");
        // Best-effort logout; even if the server call fails, signOut() also
        // clears local state, so the UI returns to a clean slate.
        void signOut();
        toast.info("Du wurdest wegen Inaktivität abgemeldet.");
      }, IDLE_MS);

      // Tell other tabs we just saw activity.
      try {
        localStorage.setItem("bewerbi.lastActivity", String(Date.now()));
      } catch {
        // localStorage may be blocked in private mode — non-fatal.
      }
    };

    const onActivity = () => {
      // Don't reset on a `visibilitychange` to hidden — that's the user
      // walking away, which is *exactly* what we want to time.
      if (document.visibilityState === "hidden") return;
      reschedule();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "bewerbi.lastActivity") reschedule();
    };

    reschedule();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    window.addEventListener("storage", onStorage);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [user, signOut]);
}
