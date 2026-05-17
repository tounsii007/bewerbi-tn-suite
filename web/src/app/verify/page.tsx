"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";

// Wrap in Suspense for static build (useSearchParams bails out otherwise).
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
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 dark:from-dark-bg dark:to-dark-bg">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          {status === "idle" && (
            <>
              <Loader2 className="size-10 animate-spin text-primary-500" />
              <p className="font-semibold">E-Mail-Adresse wird bestätigt…</p>
            </>
          )}
          {status === "ok" && (
            <>
              <CheckCircle2 className="size-10 text-success-600" />
              <h1 className="text-xl font-extrabold">E-Mail bestätigt!</h1>
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                Du kannst dich jetzt mit deinen Zugangsdaten anmelden.
              </p>
              <Button asChild className="mt-2">
                <Link href="/login">Zum Login</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="size-10 text-accent-600" />
              <h1 className="text-xl font-extrabold">Bestätigung fehlgeschlagen</h1>
              <p className="text-sm text-gray-500 dark:text-dark-muted">{error}</p>

              {resendDone ? (
                <p className="mt-4 text-sm text-emerald-600">
                  Wenn ein Konto mit dieser Adresse existiert, ist eine neue
                  Bestätigungs-Mail unterwegs.
                </p>
              ) : (
                <div className="mt-4 flex w-full flex-col gap-2">
                  <p className="text-xs text-gray-500 dark:text-dark-muted">
                    Neuen Bestätigungs-Link anfordern:
                  </p>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="du@example.tn"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                  />
                  <Button onClick={() => void resend()} disabled={!resendEmail}>
                    <Mail className="mr-2 size-4" /> Link erneut senden
                  </Button>
                </div>
              )}

              <Button asChild variant="outline" className="mt-2">
                <Link href="/login">Zur Startseite</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
