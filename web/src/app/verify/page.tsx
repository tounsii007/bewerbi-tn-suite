"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/lib/api";

export default function VerifyEmailPage() {
  const search = useSearchParams();
  const token = search.get("token");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
