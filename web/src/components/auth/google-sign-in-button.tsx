"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";
import { googleOAuthEnabled } from "./google-oauth-provider";
import type { UserRole } from "@/lib/types";

/**
 * Iter 161 — "Mit Google anmelden / registrieren" button.
 *
 * Wraps the official `<GoogleLogin>` component from @react-oauth/google,
 * which uses Google Identity Services (GIS) under the hood. The
 * `credential` field of the success callback is the ID token (a JWT
 * signed by Google) — exactly what our backend's
 * {@code GoogleIdTokenVerifier} expects.
 *
 * Hidden entirely when `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` is empty.
 *
 * @param role Only honoured server-side on **first signup**. For an
 *   existing user the backend ignores it. Pass APPLICANT/EMPLOYER on
 *   /register; omit on /login.
 * @param onSuccess Called after the JWT pair is in the store, so the
 *   page can route to /dashboard, /onboarding, etc.
 * @param text Google-branded button label variant — "signin_with"
 *   (default, "Mit Google anmelden") or "signup_with" ("Mit Google
 *   registrieren").
 */
export function GoogleSignInButton({
  role,
  onSuccess,
  text = "signin_with",
}: {
  role?: UserRole;
  onSuccess?: () => void;
  text?: "signin_with" | "signup_with";
}) {
  const t = useTranslate();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const [busy, setBusy] = useState(false);

  if (!googleOAuthEnabled()) return null;

  const handleCredential = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error(t("error.auth.google.disabled"));
      return;
    }
    setBusy(true);
    try {
      await signInWithGoogle(response.credential, role);
      onSuccess?.();
    } catch (e) {
      toast.error(apiErrorMessage(t, e, t("error.auth.google.disabled")));
    } finally {
      setBusy(false);
    }
  };

  // GIS picks the button locale automatically from `navigator.language` —
  // matches our locale-store result in the common case, and trying to
  // override it requires a per-button prop that the typed wrapper from
  // @react-oauth/google doesn't expose.
  //
  // Iter 188 — overlay a spinner + pointer-events-none on the iframe
  // wrapper while the backend round-trip is in flight. The GIS iframe
  // itself can't be styled or disabled (third-party origin), so we
  // dim it and block clicks at the wrapper level instead.
  return (
    <div
      className="relative flex w-full justify-center"
      aria-busy={busy}
      data-testid="google-sign-in-button"
    >
      <div className={busy ? "pointer-events-none opacity-50 transition-opacity" : ""}>
        <GoogleLogin
          onSuccess={handleCredential}
          onError={() => toast.error(t("error.auth.google.disabled"))}
          text={text}
          shape="rectangular"
          size="large"
          theme="outline"
          width="320"
          useOneTap={false}
        />
      </div>
      {busy && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <Loader2 className="size-5 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      )}
    </div>
  );
}
