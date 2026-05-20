"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Gültige E-Mail erforderlich"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      // Backend always returns 204 — UI is identical regardless of account
      // state, so the page itself cannot leak whether the address is registered.
      await authApi.forgotPassword(values.email);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="E-Mail unterwegs">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-500/15 text-success-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
            E-Mail unterwegs
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
            Wenn ein Konto mit dieser Adresse existiert, ist gerade ein Link
            zum Zurücksetzen unterwegs. Der Link ist{" "}
            <strong className="text-gray-900 dark:text-dark-text">
              30 Minuten gültig
            </strong>
            .
          </p>
          <Button
            asChild
            variant="gradient"
            size="lg"
            className="mt-6 w-full"
            trailingIcon={<ArrowLeft className="size-4 rotate-180" />}
          >
            <Link href="/login">Zurück zum Login</Link>
          </Button>
          <p className="mt-4 text-xs text-gray-500 dark:text-dark-muted">
            Keine E-Mail erhalten? Schau im Spam-Ordner — oder warte 60 Sek und
            versuche es erneut.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Passwort vergessen">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Passwort vergessen?</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
          Kein Problem. Gib deine E-Mail-Adresse ein und wir senden dir einen
          Link zum Zurücksetzen.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
            E-Mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-dark-muted" />
            <Input
              type="email"
              autoComplete="email"
              autoFocus
              className="pl-10"
              invalid={!!form.formState.errors.email}
              placeholder="du@example.tn"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="mt-1.5 text-xs font-medium text-accent-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          variant="gradient"
          loading={submitting}
          leadingIcon={<Mail className="size-4" />}
        >
          {submitting ? "Senden…" : "Reset-Link senden"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300"
      >
        <ArrowLeft className="size-4" />
        Zurück zum Login
      </Link>
    </AuthShell>
  );
}
