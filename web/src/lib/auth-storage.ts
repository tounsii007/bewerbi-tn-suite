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
  /** Iter 169 — mirrors AuthUser.hasPassword / hasGoogleLinked so the
   *  settings UI can branch immediately on rehydrate without waiting
   *  for /me/account to round-trip. Optional for back-compat with
   *  storage written by older builds. */
  hasPassword?: boolean;
  hasGoogleLinked?: boolean;
}

/**
 * Iter 183 — shape-validate the localStorage payload before trusting
 * it. The old version did a blind cast which let a partial / hand-
 * edited / older-schema value leak through and either crash on the
 * first property access or — worse — silently rehydrate as a partly-
 * authenticated session with undefined accessToken (every API call
 * would 401, the user would see broken pages).
 *
 * Required fields (accessToken, refreshToken, accessTokenExpiresAt,
 * refreshTokenExpiresAt, userId, role) must all be non-empty strings.
 * Optional flags (hasPassword, hasGoogleLinked) may be absent — the
 * settings UI guards on undefined and the auto-refresh from Iter 178
 * fills them in.
 *
 * Any structural mismatch wipes the slot — same outcome as a
 * JSON.parse failure, just earlier in the chain.
 */
export function readTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(LOCAL_KEY);
    return null;
  }
  if (!isStoredTokens(parsed)) {
    window.localStorage.removeItem(LOCAL_KEY);
    return null;
  }
  return parsed;
}

function isStoredTokens(value: unknown): value is StoredTokens {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return nonEmpty(v.accessToken)
    && nonEmpty(v.refreshToken)
    && nonEmpty(v.accessTokenExpiresAt)
    && nonEmpty(v.refreshTokenExpiresAt)
    && nonEmpty(v.userId)
    && nonEmpty(v.role)
    && typeof v.email === "string"
    && typeof v.preferredLocale === "string"
    && typeof v.emailVerified === "boolean";
}

function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
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
    hasPassword: resp.user.hasPassword,
    hasGoogleLinked: resp.user.hasGoogleLinked,
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
