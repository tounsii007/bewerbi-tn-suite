"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Briefcase,
  Mail,
  User,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { googleOAuthEnabled } from "@/components/auth/google-oauth-provider";
import { useAuthStore } from "@/stores/auth-store";
import { PasswordMeter } from "@/components/auth/password-meter";
import { cn } from "@/lib/cn";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";

const schema = z.object({
  firstName: z.string().min(1, "Vorname erforderlich"),
  lastName: z.string().min(1, "Nachname erforderlich"),
  email: z.string().email("Gültige E-Mail erforderlich"),
  password: z.string().min(8, "Mindestens 8 Zeichen"),
  role: z.enum(["APPLICANT", "EMPLOYER"]),
});

type RegisterValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslate();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "APPLICANT",
    },
  });

  const role = form.watch("role");
  const password = form.watch("password");

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true);
    try {
      await signUp(values);
      toast.success("Willkommen! Bitte bestätige deine E-Mail.");
      router.replace(
        values.role === "EMPLOYER" ? "/employer/dashboard" : "/onboarding",
      );
    } catch (e) {
      toast.error(apiErrorMessage(t, e, "Registrierung fehlgeschlagen"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Konto erstellen" formMaxWidth="lg">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Konto erstellen</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
          In 60 Sekunden startklar. Keine Kreditkarte, keine versteckten Gebühren.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Role toggle — segmented control */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-dark-text">
            Ich bin
          </label>
          <div className="grid grid-cols-2 gap-3">
            <RoleChoice
              icon={<UserPlus className="size-5" />}
              label="Bewerber/in"
              description="Job suchen"
              active={role === "APPLICANT"}
              onClick={() =>
                form.setValue("role", "APPLICANT", { shouldValidate: true })
              }
            />
            <RoleChoice
              icon={<Briefcase className="size-5" />}
              label="Arbeitgeber"
              description="Talente finden"
              active={role === "EMPLOYER"}
              onClick={() =>
                form.setValue("role", "EMPLOYER", { shouldValidate: true })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PrefixedField
            icon={<User className="size-4" />}
            label="Vorname"
            error={form.formState.errors.firstName?.message}
          >
            <Input
              invalid={!!form.formState.errors.firstName}
              className="pl-10"
              placeholder="Yasmine"
              {...form.register("firstName")}
            />
          </PrefixedField>
          <PrefixedField
            icon={<User className="size-4" />}
            label="Nachname"
            error={form.formState.errors.lastName?.message}
          >
            <Input
              invalid={!!form.formState.errors.lastName}
              className="pl-10"
              placeholder="Ben Ali"
              {...form.register("lastName")}
            />
          </PrefixedField>
        </div>

        <PrefixedField
          icon={<Mail className="size-4" />}
          label="E-Mail"
          error={form.formState.errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            invalid={!!form.formState.errors.email}
            className="pl-10"
            placeholder="du@example.tn"
            {...form.register("email")}
          />
        </PrefixedField>

        <div>
          <PrefixedField
            icon={<KeyRound className="size-4" />}
            label="Passwort"
            error={form.formState.errors.password?.message}
          >
            <Input
              type="password"
              autoComplete="new-password"
              invalid={!!form.formState.errors.password}
              className="pl-10"
              placeholder="Mindestens 8 Zeichen"
              {...form.register("password")}
            />
          </PrefixedField>
          <PasswordMeter value={password} />
        </div>

        <Button
          type="submit"
          size="lg"
          variant="gradient"
          loading={submitting}
          trailingIcon={<ArrowRight className="size-4" />}
        >
          {submitting ? "Erstelle Konto…" : "Konto erstellen"}
        </Button>

        <p className="text-center text-xs text-gray-500 dark:text-dark-muted">
          Mit der Registrierung akzeptierst du unsere{" "}
          <Link href="/terms" className="font-semibold text-primary-600 hover:underline">
            AGB
          </Link>{" "}
          und die{" "}
          <Link href="/privacy" className="font-semibold text-primary-600 hover:underline">
            Datenschutz&shy;erklärung
          </Link>
          .
        </p>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200 dark:bg-dark-border" />
        oder
        <span className="h-px flex-1 bg-gray-200 dark:bg-dark-border" />
      </div>

      {/* Iter 161 — Google sign-up. Forwards the selected role on first
          signup; backend ignores it for existing users. Successful sign-
          up routes the same way the password form does (onboarding for
          applicant, employer dashboard otherwise). */}
      {googleOAuthEnabled() && (
        <div className="mb-6">
          <GoogleSignInButton
            role={role}
            text="signup_with"
            onSuccess={() =>
              router.replace(
                role === "EMPLOYER" ? "/employer/dashboard" : "/onboarding",
              )
            }
          />
        </div>
      )}

      <p className="text-center text-sm text-gray-600 dark:text-dark-muted">
        Bereits ein Konto?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-600 hover:underline dark:text-primary-300"
        >
          Anmelden
        </Link>
      </p>
    </AuthShell>
  );
}

/**
 * Role-picker tile — large icon, label + caption, animated active border.
 */
function RoleChoice({
  icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
        active
          ? "border-primary-500 bg-primary-50/80 shadow-[var(--shadow-glow)] dark:bg-primary-500/15"
          : "border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30 dark:border-dark-border dark:bg-dark-card dark:hover:border-primary-500/40",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
          active
            ? "bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white"
            : "bg-gray-100 text-gray-600 dark:bg-dark-bg-alt dark:text-dark-muted",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span
          className={cn(
            "text-sm font-bold",
            active
              ? "text-primary-700 dark:text-primary-200"
              : "text-gray-900 dark:text-dark-text",
          )}
        >
          {label}
        </span>
        <span className="text-xs text-gray-500 dark:text-dark-muted">
          {description}
        </span>
      </span>
    </button>
  );
}

function PrefixedField({
  icon,
  label,
  error,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
        {label}
      </label>
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
