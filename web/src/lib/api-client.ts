/**
 * Browser-side API client.
 *
 * Every request goes through `/api/...` which Next.js rewrites to the
 * Spring Cloud Gateway (see `next.config.ts`). Benefits:
 *   - Same-origin → HttpOnly cookies work normally, no CORS dance.
 *   - We can add middleware headers (trace-id, feature flags) in one place.
 *   - The gateway URL stays out of the browser bundle when using an inner
 *     load-balancer in production.
 *
 * Features in this client:
 *   - Bearer-token injection from `readTokens()`.
 *   - `Accept-Language` header from the current `<html lang>` attribute.
 *   - Proactive refresh 60 s before access-token expiry.
 *   - On 401: transparent single retry after a refresh.
 *   - Concurrent-request safety: refresh is coalesced via an in-flight Promise.
 */

import { readTokens, writeTokens, type StoredTokens } from "./auth-storage";
import type { AuthResponse, ApiError } from "./types";

let refreshInFlight: Promise<AuthResponse> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let onUnauthorizedHandler: () => void = () => {};

export function setOnUnauthorized(handler: () => void): void {
  onUnauthorizedHandler = handler;
}

function currentLanguage(): string {
  if (typeof document === "undefined") return "de";
  return document.documentElement.lang || "de";
}

/**
 * Iter 192 — short, URL-safe correlation id. crypto.randomUUID is
 * the natural choice (36 chars, RFC 4122 v4) — both browsers and
 * the Edge runtime expose it. Length matches what Spring Boot's
 * MDC fields display, so logs read cleanly.
 *
 * Falls back to a Math.random base-36 string for ancient browsers
 * that lack crypto.randomUUID (Safari < 15.4, Edge < 80) — those
 * are well below 1% of our traffic but cheap to handle.
 */
function randomCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36)
    + "-"
    + Math.random().toString(36).slice(2, 10)
  );
}

function scheduleProactiveRefresh(tokens: StoredTokens): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  const expiresAtMs = new Date(tokens.accessTokenExpiresAt).getTime();
  const delay = Math.max(5_000, expiresAtMs - Date.now() - 60_000);
  refreshTimer = setTimeout(() => {
    void refreshTokens().catch(() => onUnauthorizedHandler());
  }, delay);
}

export function armRefreshTimer(): void {
  const t = readTokens();
  if (t) scheduleProactiveRefresh(t);
}

export function disarmRefreshTimer(): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
}

async function refreshTokens(): Promise<AuthResponse> {
  if (refreshInFlight) return refreshInFlight;
  const tokens = readTokens();
  if (!tokens) {
    const err: ApiError = { status: 401, code: "NO_REFRESH_TOKEN", message: "No refresh token" };
    throw err;
  }

  refreshInFlight = (async () => {
    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ApiError;
        throw { status: res.status, code: err.code ?? "REFRESH_FAILED", message: err.message ?? res.statusText } satisfies ApiError;
      }
      const resp = (await res.json()) as AuthResponse;
      writeTokens(resp);
      armRefreshTimer();
      return resp;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// ────────────────────────────────────────────────────────────────────────
// Low-level request
// ────────────────────────────────────────────────────────────────────────

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function rawRequest<T>(path: string, opts: FetchOptions = {}, withAuth = true): Promise<T> {
  const headers = new Headers(opts.headers);
  if (opts.body !== undefined && !(opts.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept-Language", currentLanguage());
  // Iter 192 — per-request correlation id. The backend's MDC filter
  // already generates one when missing, but having the client mint
  // it lets devtools-network show the value alongside the request,
  // which means a user can quote "trace 7f3c…" in a support ticket
  // and ops can grep server logs for it without juggling timestamps.
  // We only set it when the caller didn't already, so explicit
  // overrides for e.g. retry-chain tracing still work.
  if (!headers.has("X-Correlation-Id")) {
    headers.set("X-Correlation-Id", randomCorrelationId());
  }

  if (withAuth) {
    const t = readTokens();
    if (t) headers.set("Authorization", `Bearer ${t.accessToken}`);
  }

  const body =
    opts.body === undefined || opts.body instanceof FormData
      ? (opts.body as BodyInit | undefined)
      : JSON.stringify(opts.body);

  const res = await fetch(path, { ...opts, headers, body, credentials: "include" });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw {
      status: res.status,
      code: err.code ?? "UNKNOWN",
      message: err.message ?? res.statusText,
      messageKey: err.messageKey,
      violations: err.violations,
    } satisfies ApiError;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ────────────────────────────────────────────────────────────────────────
// Public API — handles the 401-retry dance
// ────────────────────────────────────────────────────────────────────────

async function apiRequest<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, opts, true);
  } catch (e) {
    const err = e as ApiError;
    if (err.status !== 401) throw err;

    const t = readTokens();
    if (!t?.refreshToken) {
      onUnauthorizedHandler();
      throw err;
    }

    try {
      await refreshTokens();
    } catch {
      writeTokens(null);
      onUnauthorizedHandler();
      throw err;
    }
    return rawRequest<T>(path, opts, true);
  }
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    apiRequest<T>(path, { method: "POST", body: formData }),
  /** Public, unauthenticated call — used for login/register/refresh. */
  public: <T>(path: string, opts: FetchOptions = {}) => rawRequest<T>(path, opts, false),
};

/**
 * Persist fresh tokens and schedule the next refresh. Called by the
 * auth-store after successful login / register.
 */
export function onLoginSuccess(resp: AuthResponse): void {
  writeTokens(resp);
  armRefreshTimer();
}

export function logoutLocal(): void {
  disarmRefreshTimer();
  writeTokens(null);
}
