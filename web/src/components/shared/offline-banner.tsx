"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Subtle banner that slides in when the browser loses connectivity. Visual-only — feature
 * code should still handle network failures defensively.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-warning-500 px-4 py-2 text-sm font-semibold text-white shadow-lg animate-fade-in-up"
    >
      <WifiOff className="size-4" aria-hidden />
      Du bist offline — einige Aktionen sind eingeschränkt.
    </div>
  );
}
