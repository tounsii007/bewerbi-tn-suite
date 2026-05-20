"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { authApi } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const search = useSearchParams();
  const token = search.get("token");
  const t = useTranslate();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendDone, setResendDone] = useState(false);

  const resend = async () => {
    if (!resendEmail) return;
    try {
      await authApi.resendVerification(resendEmail);
      setResendDone(true);
    } catch (e) {
      toast.error(apiErrorMessage(t, e, "Senden fehlgeschlagen"));
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Kein Token in der URL gefunden.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("ok"))
      .catch((e: { message?: string }) => {
        setStatus("error");
        setError(e.message ?? "Token ungültig oder abgelaufen.");
      });
  }, [token]);

  return (
    <AuthShell title="E-Mail bestätigen">
      <div className="text-center">
        {status === "idle" && (
          <>
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-500/15 text-primary-600">
              <Loader2 className="size-8 animate-spin" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
              E-Mail wird bestätigt
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
              Einen kleinen Moment, wir prüfen deinen Link…
            </p>
          </>
        )}

        {status === "ok" && (
          <>
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-500/15 text-success-600">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
              E-Mail bestätigt!
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
              Dein Konto ist jetzt aktiv. Du kannst dich anmelden und mit deiner
              Reise nach Deutschland loslegen.
            </p>
            <Button
              asChild
              variant="gradient"
              size="lg"
              className="mt-6 w-full"
              trailingIcon={<ArrowRight className="size-4" />}
            >
              <Link href="/login">Zum Login</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-500/15 text-accent-600">
              <XCircle className="size-8" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
              Bestätigung fehlgeschlagen
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
              {error}
            </p>

            {resendDone ? (
              <p className="mt-5 rounded-xl bg-success-500/10 px-4 py-3 text-sm font-medium text-success-700 dark:text-success-500">
                Wenn ein Konto mit dieser Adresse existiert, ist eine neue
                Bestätigungs-Mail unterwegs.
              </p>
            ) : (
              <div className="mt-6 space-y-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                  Neuen Bestätigungs-Link anfordern
                </p>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-dark-muted" />
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="du@example.tn"
                    className="pl-10"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={() => void resend()}
                  disabled={!resendEmail}
                  leadingIcon={<Mail className="size-4" />}
                >
                  Link erneut senden
                </Button>
              </div>
            )}

            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-3 w-full"
            >
              <Link href="/login">Zum Login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
