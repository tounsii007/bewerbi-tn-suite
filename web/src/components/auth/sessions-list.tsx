"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Monitor, Globe } from "lucide-react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "sonner";

/** Pick a sensible icon from the User-Agent without pulling a parser. */
function deviceIcon(ua: string) {
  const lc = ua.toLowerCase();
  if (lc.includes("android") || lc.includes("iphone") || lc.includes("mobile")) {
    return <Smartphone className="size-4" />;
  }
  if (lc.includes("windows") || lc.includes("mac") || lc.includes("linux")) {
    return <Monitor className="size-4" />;
  }
  return <Globe className="size-4" />;
}

/** Short label for a UA — first browser/OS pair we can spot. Falls back to
 *  the raw UA truncated to 60 chars. */
function deviceLabel(ua: string): string {
  if (!ua) return "Unbekanntes Gerät";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "Browser";
  const os =
    /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : "";
  return os ? `${browser} · ${os}` : browser;
}

function formatCreatedAt(epochSec: number): string {
  if (!epochSec) return "—";
  const d = new Date(epochSec * 1000);
  return d.toLocaleString();
}

export function SessionsList() {
  const qc = useQueryClient();
  const toastApiError = useApiErrorToast();
  const q = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: () => authApi.sessions(),
  });

  const revoke = async (hash: string) => {
    try {
      await authApi.revokeSession(hash);
      toast.success("Sitzung beendet");
      await qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
    } catch (e) {
      toastApiError(e, "Beenden fehlgeschlagen");
    }
  };

  if (q.isLoading) return <Skeleton className="h-24" />;
  if (q.isError) return <p className="text-sm text-accent-600">Sitzungen konnten nicht geladen werden.</p>;
  const sessions = q.data ?? [];
  if (sessions.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-dark-muted">Keine aktiven Sitzungen.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((s) => (
        <li
          key={s.tokenHash}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-dark-border dark:bg-dark-card"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-gray-500 dark:text-dark-muted">
              {deviceIcon(s.userAgent)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-dark-text">
                {deviceLabel(s.userAgent)}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted">
                Angemeldet seit {formatCreatedAt(s.createdAt)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void revoke(s.tokenHash)}
          >
            Beenden
          </Button>
        </li>
      ))}
    </ul>
  );
}
