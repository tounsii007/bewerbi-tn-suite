"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, XCircle, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { authApi } from "@/lib/api";
import { PasswordMeter } from "@/components/auth/password-meter";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mindestens 8 Zeichen")
      .max(72, "Maximal 72 Zeichen"),
    confirm: z.string().min(1, "Passwort bestätigen"),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ["confirm"],
    message: "Passwörter stimmen nicht überein",
  });

type FormValues = z.infer<typeof schema>;

/**
 * Iter 164 — reads `?token=` via window.location in a useEffect
 * instead of useSearchParams(). This keeps the page fully prerender-
 * able (no Suspense bail) so Playwright can assert against static
 * HTML without depending on client-side hydration to fill in chrome.
 *
 * The {@link tokenState} = "loading" branch renders the page chrome
 * + a tiny skeleton on first paint. The useEffect runs after mount
 * and resolves to either "missing" (no token in URL) or "ready" (we
 * have one). The form / no-token / success branches all render the
 * inner content; the page chrome is owned by AuthShell.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const t = useTranslate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("token");
    setToken(value && value.length > 0 ? value : null);
    setTokenLoaded(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirm: "" },
  });
  const newPassword = form.watch("newPassword");

  // First paint (pre-effect): show the chrome + a tiny skeleton. The
  // effect resolves the token on next tick, then we re-render into the
  // form / no-token / success branch.
  if (!tokenLoaded) {
    return (
      <AuthShell title="Passwort zurücksetzen">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Passwort zurücksetzen
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Folge dem Link aus deiner E-Mail und wähle ein neues Passwort.
          </p>
        </div>
        <div className="space-y-3" aria-hidden="true" data-testid="reset-skeleton">
          <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-dark-bg-alt" />
          <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-dark-bg-alt" />
          <div className="h-12 w-full rounded-xl bg-gray-100 dark:bg-dark-bg-alt" />
        </div>
      </AuthShell>
    );
  }

  if (!token) {
    return (
      <AuthShell title="Kein Token">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-500/15 text-accent-600">
            <XCircle className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
            Link unvollständig
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
            Dieser Link enthält kein gültiges Token. Bitte fordere einen neuen
            Reset-Link an.
          </p>
          <Button
            asChild
            variant="gradient"
            size="lg"
            className="mt-6 w-full"
          >
            <Link href="/forgot-password">Neuen Link anfordern</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  async function onSubmit(values: FormValues) {
    // token is non-null here — the branch above ensures it before this
    // returns the form; TS just can't follow the control flow through
    // the closure.
    if (!token) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, values.newPassword);
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (e) {
      toast.error(apiErrorMessage(t, e, "Link ungültig oder abgelaufen."));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Passwort aktualisiert">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-500/15 text-success-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
            Passwort aktualisiert
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
            Du wirst gleich zum Login weitergeleitet…
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-success-700 dark:text-success-500">
            <ShieldCheck className="size-4" />
            Alle bestehenden Sessions wurden beendet.
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Passwort zurücksetzen">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">
          Neues Passwort wählen
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
          Achte auf ein starkes Passwort — die Stärke wird live geprüft.
        </p>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
            Neues Passwort
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-dark-muted" />
            <Input
              type="password"
              autoComplete="new-password"
              autoFocus
              invalid={!!form.formState.errors.newPassword}
              className="pl-10"
              placeholder="Mindestens 8 Zeichen"
              {...form.register("newPassword")}
            />
          </div>
          {form.formState.errors.newPassword && (
            <p className="mt-1.5 text-xs font-medium text-accent-600">
              {form.formState.errors.newPassword.message}
            </p>
          )}
          <PasswordMeter value={newPassword} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
            Passwort bestätigen
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-dark-muted" />
            <Input
              type="password"
              autoComplete="new-password"
              invalid={!!form.formState.errors.confirm}
              className="pl-10"
              placeholder="Wiederholen"
              {...form.register("confirm")}
            />
          </div>
          {form.formState.errors.confirm && (
            <p className="mt-1.5 text-xs font-medium text-accent-600">
              {form.formState.errors.confirm.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          variant="gradient"
          loading={submitting}
        >
          {submitting ? "Speichern…" : "Passwort speichern"}
        </Button>

        <p className="text-center text-xs text-gray-500 dark:text-dark-muted">
          Nach dem Speichern werden alle aktiven Sessions abgemeldet.
        </p>
      </form>
    </AuthShell>
  );
}
