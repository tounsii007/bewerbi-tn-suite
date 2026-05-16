"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { safeRedirectPath } from "@/lib/security";

const schema = z.object({
  email: z.string().email("Gültige E-Mail erforderlich"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const signIn = useAuthStore((s) => s.signIn);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // Reject open-redirects to off-site URLs (?redirect=//evil.example).
      const redirect = safeRedirectPath(search.get("redirect"), "/dashboard");
      router.replace(redirect);
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? "Anmeldung fehlgeschlagen");
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
        <CardHeader>
          <CardTitle>Willkommen zurück</CardTitle>
          <CardDescription>Melde dich mit deiner E-Mail an.</CardDescription>
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
                <p className="mt-1 text-xs text-accent-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
                  Passwort
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
                  Vergessen?
                </Link>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-accent-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Anmelden…" : "Anmelden"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-dark-muted">
            Noch kein Konto?{" "}
            <Link href="/register" className="font-semibold text-primary-600 hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
