"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

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

function ResetForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <XCircle className="size-10 text-accent-600" />
          <h1 className="text-xl font-extrabold">Kein Token</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Der Link ist unvollständig. Bitte fordere einen neuen Reset-Link an.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/forgot-password">Neuen Link anfordern</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, values.newPassword);
      setDone(true);
      // Stay on this page briefly so the success message is seen, then route.
      setTimeout(() => router.replace("/login"), 1500);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? "Link ungültig oder abgelaufen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="size-10 text-success-600" />
          <h1 className="text-xl font-extrabold">Passwort aktualisiert</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Du wirst gleich zum Login weitergeleitet…
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Neues Passwort wählen</CardTitle>
        <CardDescription>
          Gib dein neues Passwort ein. Du wirst danach auf allen Geräten abgemeldet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
              Neues Passwort
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              autoFocus
              invalid={!!form.formState.errors.newPassword}
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-accent-600">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
              Passwort bestätigen
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              invalid={!!form.formState.errors.confirm}
              {...form.register("confirm")}
            />
            {form.formState.errors.confirm && (
              <p className="mt-1 text-xs text-accent-600">
                {form.formState.errors.confirm.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Speichern…" : "Passwort speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 dark:from-dark-bg dark:to-dark-bg">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
