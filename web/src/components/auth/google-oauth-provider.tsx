"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Iter 161 — env-var-gated wrapper around `<GoogleOAuthProvider>`.
 *
 * When `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` is unset (default in dev),
 * we render children directly and `googleOAuthEnabled()` returns false
 * so the "Mit Google anmelden" buttons stay hidden. This avoids pop-up
 * failures and console errors on a developer machine that hasn't been
 * provisioned with a Google client ID.
 *
 * In prod (or any env where the env var is set), the provider injects
 * the GIS script and the button components light up.
 */
export function googleClientId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
  return id && id.trim().length > 0 ? id : undefined;
}

export function googleOAuthEnabled(): boolean {
  return googleClientId() !== undefined;
}

export function GoogleOAuthBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = googleClientId();
  if (!clientId) return <>{children}</>;
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
