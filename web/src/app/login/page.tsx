"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { googleOAuthEnabled } from "@/components/auth/google-oauth-provider";
import { useAuthStore } from "@/stores/auth-store";
import { safeRedirectPath } from "@/lib/security";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";

const schema = z.object({
  email: z.string().email("Gültige E-Mail erforderlich"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const signIn = useAuthStore((s) => s.signIn);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslate();

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      const redirect = safeRedirectPath(search.get("redirect"), "/dashboard");
      router.replace(redirect);
    } catch (e) {
      toast.error(apiErrorMessage(t, e, "Anmeldung fehlgeschlagen"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Anmelden">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Willkommen zurück</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
          Schön, dass du da bist. Melde dich an, um weiterzumachen.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field
          icon={<Mail className="size-4" />}
          label="E-Mail"
          error={form.formState.errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            autoFocus
            invalid={!!form.formState.errors.email}
            placeholder="du@example.tn"
            className="pl-10"
            {...form.register("email")}
          />
        </Field>

        <Field
          icon={<KeyRound className="size-4" />}
          label="Passwort"
          labelEnd={
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-300"
            >
              Vergessen?
            </Link>
          }
          error={form.formState.errors.password?.message}
        >
          <Input
            type="password"
            autoComplete="current-password"
            invalid={!!form.formState.errors.password}
            placeholder="••••••••"
            className="pl-10"
            {...form.register("password")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          variant="gradient"
          loading={submitting}
          trailingIcon={<ArrowRight className="size-4" />}
        >
          {submitting ? "Anmelden…" : "Anmelden"}
        </Button>
      </form>

      {/* Iter 161 — Google sign-in slots between the password form and
          the register-link footer. The "oder" divider is shared with
          the footer block below — we render it once and let the Google
          button conditionally appear above it. */}
      <div className="my-7 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200 dark:bg-dark-border" />
        oder
        <span className="h-px flex-1 bg-gray-200 dark:bg-dark-border" />
      </div>

      {googleOAuthEnabled() && (
        <div className="mb-6">
          <GoogleSignInButton
            onSuccess={() => {
              const redirect = safeRedirectPath(search.get("redirect"), "/dashboard");
              router.replace(redirect);
            }}
          />
        </div>
      )}

      <p className="text-center text-sm text-gray-600 dark:text-dark-muted">
        Noch kein Konto?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary-600 hover:underline dark:text-primary-300"
        >
          Jetzt registrieren
        </Link>
      </p>
    </AuthShell>
  );
}

/**
 * Shared field wrapper for auth forms — icon-prefixed label, optional
 * right-aligned action, inline error.
 */
function Field({
  icon,
  label,
  labelEnd,
  error,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  labelEnd?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-text">
          <span className="text-gray-400 dark:text-dark-muted">{icon}</span>
          {label}
        </label>
        {labelEnd}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-accent-600">{error}</p>
      )}
    </div>
  );
}
