"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Briefcase, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { PasswordMeter } from "@/components/auth/password-meter";
import { cn } from "@/lib/cn";

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

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", role: "APPLICANT" },
  });

  const role = form.watch("role");
  const password = form.watch("password");

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true);
    try {
      await signUp(values);
      toast.success("Willkommen! Bitte bestätige deine E-Mail.");
      router.replace(values.role === "EMPLOYER" ? "/employer/dashboard" : "/onboarding");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? "Registrierung fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 py-10 dark:from-dark-bg dark:to-dark-bg">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Konto erstellen</CardTitle>
          <CardDescription>Starte in 60 Sekunden deine Reise nach Deutschland.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-dark-text">
                Ich bin
              </label>
              <div className="grid grid-cols-2 gap-2">
                <RoleChoice
                  icon={<UserPlus className="size-5" />}
                  label="Bewerber/in"
                  active={role === "APPLICANT"}
                  onClick={() => form.setValue("role", "APPLICANT", { shouldValidate: true })}
                />
                <RoleChoice
                  icon={<Briefcase className="size-5" />}
                  label="Arbeitgeber"
                  active={role === "EMPLOYER"}
                  onClick={() => form.setValue("role", "EMPLOYER", { shouldValidate: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <LabeledInput label="Vorname" invalid={!!form.formState.errors.firstName} error={form.formState.errors.firstName?.message} {...form.register("firstName")} />
              <LabeledInput label="Nachname" invalid={!!form.formState.errors.lastName} error={form.formState.errors.lastName?.message} {...form.register("lastName")} />
            </div>

            <LabeledInput
              label="E-Mail"
              type="email"
              autoComplete="email"
              invalid={!!form.formState.errors.email}
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <div>
              <LabeledInput
                label="Passwort"
                type="password"
                autoComplete="new-password"
                invalid={!!form.formState.errors.password}
                error={form.formState.errors.password?.message}
                {...form.register("password")}
              />
              <PasswordMeter value={password} />
            </div>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Erstelle Konto…" : "Registrieren"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-dark-muted">
            Bereits ein Konto?{" "}
            <Link href="/login" className="font-semibold text-primary-600 hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function RoleChoice({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors",
        active
          ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

const LabeledInput = ({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; invalid?: boolean; error?: string }) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">{label}</label>
    <Input {...props} />
    {error && <p className="mt-1 text-xs text-accent-600">{error}</p>}
  </div>
);
