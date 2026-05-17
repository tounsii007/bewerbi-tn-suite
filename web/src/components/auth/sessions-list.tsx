"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Monitor, Globe } from "lucide-react";
import { authApi } from "@/lib/api";
import { readTokens } from "@/lib/auth-storage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "sonner";

/** SHA-256 of the locally-stored refresh token. Matches the server's
 *  session.tokenHash so we can mark "this device" in the list. */
async function currentRefreshHash(): Promise<string | null> {
  const t = readTokens();
  if (!t?.refreshToken || typeof window === "undefined" || !window.crypto?.subtle) {
    return null;
  }
  const bytes = new TextEncoder().encode(t.refreshToken);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void currentRefreshHash().then((h) => {
      if (alive) setCurrentHash(h);
    });
    return () => {
      alive = false;
    };
  }, []);
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
  const otherCount = currentHash
    ? sessions.filter((s) => s.tokenHash !== currentHash).length
    : sessions.length;

  const revokeOthers = async () => {
    try {
      const result = await authApi.revokeOtherSessions(currentHash ?? undefined);
      toast.success(
        result.revoked === 1
          ? "1 andere Sitzung beendet."
          : `${result.revoked} andere Sitzungen beendet.`,
      );
      await qc.invalidateQueries({ queryKey: ["auth", "sessions"] });
    } catch (e) {
      toastApiError(e, "Beenden fehlgeschlagen");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {otherCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => void revokeOthers()}>
            Auf allen anderen Geräten abmelden
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {sessions.map((s) => {
        const isCurrent = currentHash !== null && s.tokenHash === currentHash;
        return (
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
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      Dieses Gerät
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  Zuletzt aktiv {formatCreatedAt(s.lastUsedAt || s.createdAt)}
                  {s.ip && (
                    <>
                      {" · "}
                      <span className="font-mono">{s.ip}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              // Revoking the current session would log the user out
              // mid-page. Use the dedicated logout for that.
              disabled={isCurrent}
              title={isCurrent ? "Über „Abmelden" beenden" : undefined}
              onClick={() => void revoke(s.tokenHash)}
            >
              Beenden
            </Button>
          </li>
        );
        })}
      </ul>
    </div>
  );
}
