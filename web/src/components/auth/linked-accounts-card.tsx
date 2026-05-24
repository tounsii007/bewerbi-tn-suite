"use client";

import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { Check, Link2, Link2Off, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordMeter } from "@/components/auth/password-meter";
import { googleOAuthEnabled } from "@/components/auth/google-oauth-provider";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";

/**
 * Iter 169 — "Verknüpfte Konten" card in /settings.
 *
 * Branches on the user's current state (hasPassword, hasGoogleLinked):
 *  - has password + no Google → "Mit Google verknüpfen" button
 *  - has password + has Google → linked-row + "Verknüpfung entfernen"
 *  - no password + has Google → "Passwort hinzufügen" form (OAuth-only
 *    user wants a fallback login method)
 *  - no password + no Google → impossible state (every user has at
 *    least one auth method), so we render a defensive fallback message
 *
 * Hidden when the Google OAuth client ID isn't configured AND the
 * account already has a password (nothing the user can do here).
 */
export function LinkedAccountsCard() {
  const t = useTranslate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshAccount = useAuthStore((s) => s.refreshAccount);

  if (!user) return null;

  const { hasPassword, hasGoogleLinked } = user;
  const oauthAvailable = googleOAuthEnabled();

  // Iter 178 — older localStorage written before Iter 169 doesn't
  // carry these flags. Without this guard the card would render
  // "add a password" against accounts that already have one, then
  // POST set-initial-password and get 409. The settings page does
  // a refreshAccount() on mount so this state is transient; until
  // it resolves, render an unobtrusive skeleton so the UI doesn't
  // flicker between wrong → right.
  if (hasPassword === undefined || hasGoogleLinked === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.linked.title")}</CardTitle>
          <CardDescription>{t("settings.linked.tagline")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-3"
            aria-hidden="true"
            data-testid="linked-skeleton"
          >
            <div className="h-12 w-full rounded-xl bg-gray-100 dark:bg-dark-bg-alt" />
            <div className="h-12 w-full rounded-xl bg-gray-100 dark:bg-dark-bg-alt" />
            <div className="h-10 w-1/3 rounded-xl bg-gray-100 dark:bg-dark-bg-alt" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hide the card entirely when there's literally nothing actionable.
  if (!oauthAvailable && hasPassword && !hasGoogleLinked) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.linked.title")}</CardTitle>
        <CardDescription>{t("settings.linked.tagline")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Password method status */}
        <MethodRow
          icon={<KeyRound className="size-4" />}
          label={t("settings.linked.password")}
          subtitle={hasPassword
            ? t("settings.linked.passwordActive")
            : t("settings.linked.passwordMissing")}
          status={hasPassword ? "active" : "missing"}
        />

        {/* Google method status */}
        <MethodRow
          icon={<GoogleGlyph />}
          label="Google"
          subtitle={hasGoogleLinked
            ? t("settings.linked.googleActive")
            : t("settings.linked.googleMissing")}
          status={hasGoogleLinked ? "active" : "missing"}
        />

        <div className="border-t border-gray-200 pt-4 dark:border-dark-border" />

        {/* Action buttons */}
        {!hasGoogleLinked && oauthAvailable && hasPassword && (
          <LinkGoogleButton onLinked={refreshAccount} />
        )}
        {hasGoogleLinked && hasPassword && (
          <UnlinkGoogleButton onUnlinked={refreshAccount} />
        )}
        {!hasPassword && (
          <SetInitialPasswordForm
            onSet={async () => {
              // setInitialPassword revokes every refresh token server-
              // side, so we must sign-out locally and route to /login.
              toast.success(t("settings.linked.passwordSetSuccess"));
              await signOut();
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function MethodRow({
  icon,
  label,
  subtitle,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  status: "active" | "missing";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-lg bg-gray-100 text-gray-600 dark:bg-dark-bg-alt dark:text-dark-muted">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-gray-500 dark:text-dark-muted">{subtitle}</p>
      </div>
      {status === "active" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-500/15 dark:text-success-300">
          <Check className="size-3" />
          {/* "Aktiv" / "Active" / "نشط" — translation below */}
          <ActiveLabel />
        </span>
      ) : null}
    </div>
  );
}

function ActiveLabel() {
  const t = useTranslate();
  return <>{t("settings.linked.statusActive")}</>;
}

function LinkGoogleButton({ onLinked }: { onLinked: () => void | Promise<void> }) {
  const t = useTranslate();
  const [busy, setBusy] = useState(false);

  const handleCredential = async (resp: CredentialResponse) => {
    if (!resp.credential) {
      toast.error(t("error.auth.google.disabled"));
      return;
    }
    setBusy(true);
    try {
      await authApi.linkGoogle(resp.credential);
      toast.success(t("settings.linked.googleLinkSuccess"));
      await onLinked();
    } catch (e) {
      toast.error(apiErrorMessage(t, e, t("error.auth.google.disabled")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">{t("settings.linked.linkGooglePrompt")}</p>
      <div className="opacity-100 transition-opacity" aria-busy={busy}>
        <GoogleLogin
          onSuccess={handleCredential}
          onError={() => toast.error(t("error.auth.google.disabled"))}
          text="continue_with"
          shape="rectangular"
          size="large"
          theme="outline"
          width="320"
          useOneTap={false}
        />
      </div>
    </div>
  );
}

function UnlinkGoogleButton({ onUnlinked }: { onUnlinked: () => void | Promise<void> }) {
  const t = useTranslate();
  const [busy, setBusy] = useState(false);

  const handleUnlink = async () => {
    const ok = typeof window !== "undefined"
      && window.confirm(t("settings.linked.unlinkConfirm"));
    if (!ok) return;
    setBusy(true);
    try {
      await authApi.unlinkGoogle();
      toast.success(t("settings.linked.googleUnlinkSuccess"));
      await onUnlinked();
    } catch (e) {
      toast.error(apiErrorMessage(t, e, t("error.auth.google.disabled")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={() => void handleUnlink()}
      disabled={busy}
      className="self-start"
    >
      <Link2Off className="size-4" />
      {busy ? t("common.loading") : t("settings.linked.unlinkGoogle")}
    </Button>
  );
}

function SetInitialPasswordForm({ onSet }: { onSet: () => void | Promise<void> }) {
  const t = useTranslate();
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSet = async () => {
    if (newPwd.length < 8) {
      toast.error(t("error.auth.password.weak.length"));
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error(t("settings.linked.passwordMismatch"));
      return;
    }
    setBusy(true);
    try {
      await authApi.setInitialPassword(newPwd);
      await onSet();
    } catch (e) {
      toast.error(apiErrorMessage(t, e, t("settings.linked.passwordSetError")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-xl bg-info-50 px-3 py-2 text-xs text-info-700 dark:bg-info-500/10 dark:text-info-300">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <p>{t("settings.linked.passwordWhy")}</p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
          {t("settings.linked.passwordNewLabel")}
        </label>
        <Input
          type="password"
          autoComplete="new-password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
        />
        <PasswordMeter value={newPwd} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
          {t("settings.linked.passwordConfirmLabel")}
        </label>
        <Input
          type="password"
          autoComplete="new-password"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
        />
      </div>
      <Button
        onClick={() => void handleSet()}
        disabled={busy || !newPwd || !confirmPwd}
        className="self-start"
      >
        <Link2 className="size-4" />
        {busy ? t("common.loading") : t("settings.linked.passwordSetCta")}
      </Button>
    </div>
  );
}

/** Reused mini Google "G" — same as recent-activity row. */
function GoogleGlyph() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.4 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
