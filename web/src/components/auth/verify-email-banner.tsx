"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";

/**
 * Persistent nudge that an unverified user should confirm their email.
 * Renders nothing for verified users or anonymous visitors. Dismissal
 * is per-session (memory only) — the banner reappears on the next
 * page load so an account that stays unverified for weeks keeps
 * getting reminded.
 */
export function VerifyEmailBanner() {
  const user = useAuthStore((s) => s.user);
  const toastApiError = useApiErrorToast();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const resend = async () => {
    setSending(true);
    try {
      await authApi.resendVerification(user.email);
      toast.success("Bestätigungs-Mail unterwegs.");
    } catch (e) {
      toastApiError(e, "Senden fehlgeschlagen");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <AlertCircle className="size-4 shrink-0" />
      <p className="flex-1">
        Deine E-Mail-Adresse ist noch nicht bestätigt. Manche Funktionen sind eingeschränkt.
      </p>
      <button
        type="button"
        onClick={() => void resend()}
        disabled={sending}
        className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {sending ? "Senden…" : "Bestätigungs-Mail senden"}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Schließen"
        className="rounded-full p-1 hover:bg-amber-100 dark:hover:bg-amber-500/15"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
