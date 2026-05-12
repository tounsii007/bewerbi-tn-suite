/**
 * Client-side token storage.
 *
 * We use localStorage for resilience across tabs plus an HttpOnly cookie
 * called `bewerbi.session` maintained by /api/session — that cookie is what
 * the Next.js middleware checks, since it can't read localStorage.
 */

import type { AuthResponse } from "./types";

const LOCAL_KEY = "bewerbi.auth.v1";

export interface StoredTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userId: string;
  role: string;
  email: string;
  emailVerified: boolean;
  preferredLocale: string;
}

export function readTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    window.localStorage.removeItem(LOCAL_KEY);
    return null;
  }
}

export function writeTokens(resp: AuthResponse | null): void {
  if (typeof window === "undefined") return;
  if (!resp) {
    window.localStorage.removeItem(LOCAL_KEY);
    // Clear the session cookie so middleware logs the user out.
    void fetch("/api/session", { method: "DELETE" });
    return;
  }
  const stored: StoredTokens = {
    accessToken: resp.accessToken,
    accessTokenExpiresAt: resp.accessTokenExpiresAt,
    refreshToken: resp.refreshToken,
    refreshTokenExpiresAt: resp.refreshTokenExpiresAt,
    userId: resp.user.id,
    role: resp.user.role,
    email: resp.user.email,
    emailVerified: resp.user.emailVerified,
    preferredLocale: resp.user.preferredLocale,
  };
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(stored));
  // Mirror key fields into an HttpOnly cookie via the /api/session route.
  void fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: stored.userId,
      role: stored.role,
      expiresAt: stored.accessTokenExpiresAt,
    }),
  });
}

export function clearTokens(): void {
  writeTokens(null);
}
