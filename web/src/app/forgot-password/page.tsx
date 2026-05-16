"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

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
      // Backend always returns 204 — same UI regardless of account state,
      // so the page itself cannot leak whether the address is registered.
      await authApi.forgotPassword(values.email);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 dark:from-dark-bg dark:to-dark-bg">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        {done ? (
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <CheckCircle2 className="size-10 text-success-600" />
            <h1 className="text-xl font-extrabold">E-Mail unterwegs</h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Wenn ein Konto mit dieser Adresse existiert, ist gerade ein Link
              zum Zurücksetzen unterwegs. Der Link ist 30 Minuten gültig.
            </p>
            <Button asChild className="mt-2">
              <Link href="/login">Zum Login</Link>
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Passwort vergessen?</CardTitle>
              <CardDescription>
                Wir senden dir einen Link, mit dem du dein Passwort neu setzen kannst.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
                    E-Mail
                  </label>
                  <Input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    invalid={!!form.formState.errors.email}
                    {...form.register("email")}
                    placeholder="du@example.tn"
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-accent-600">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg" disabled={submitting}>
                  <Mail className="mr-2 size-4" />
                  {submitting ? "Senden…" : "Link senden"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-dark-muted">
                <Link href="/login" className="font-semibold text-primary-600 hover:underline">
                  Zurück zum Login
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  );
}
