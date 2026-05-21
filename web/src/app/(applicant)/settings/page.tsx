"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PasswordMeter } from "@/components/auth/password-meter";
import { SessionsList } from "@/components/auth/sessions-list";
import { DeleteAccountCard } from "@/components/auth/delete-account-card";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-errors";
import { useTranslate } from "@/i18n/use-translate";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const t = useTranslate();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changing, setChanging] = useState(false);

  const logoutAllDevices = async () => {
    try {
      await authApi.logoutAll();
      toast.success("Auf allen Geräten abgemeldet");
      await signOut();
    } catch (e) {
      toast.error(apiErrorMessage(t, e, "Abmelden fehlgeschlagen"));
    }
  };

  const changePassword = async () => {
    if (newPwd.length < 8) {
      toast.error("Neues Passwort: mindestens 8 Zeichen.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }
    setChanging(true);
    try {
      await authApi.changePassword(oldPwd, newPwd);
      // Backend revokes every refresh token, including ours — sign out
      // locally and route to login so the next call doesn't fire a
      // pointless silent-refresh.
      toast.success("Passwort aktualisiert. Bitte erneut anmelden.");
      await signOut();
      router.replace("/login");
    } catch (e) {
      toast.error(apiErrorMessage(t, e, "Passwortänderung fehlgeschlagen"));
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Reveal>
        <header className="flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-info-500),var(--color-primary-500))] text-white shadow-[var(--shadow-glow)]">
            <SettingsIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              <GradientText variant="brand">Einstellungen</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Konto, Sicherheit, Darstellung — alles an einem Ort.
            </p>
          </div>
        </header>
      </Reveal>

      <Card>
        <CardHeader>
          <CardTitle>Darstellung</CardTitle>
          <CardDescription>Sprache und Theme der App.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.section.account")}</CardTitle>
          <CardDescription>Angemeldet als <b>{user?.email}</b>.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" /> Abmelden
          </Button>
          <Button variant="destructive" onClick={() => void logoutAllDevices()}>
            Auf allen Geräten abmelden
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktive Sitzungen</CardTitle>
          <CardDescription>
            Beende einzelne Sitzungen, ohne dich auf allen Geräten abzumelden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
          <CardDescription>
            Du wirst nach der Änderung auf allen Geräten abgemeldet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
              Aktuelles Passwort
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
              Neues Passwort
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
            <PasswordMeter value={newPwd} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
              Neues Passwort bestätigen
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </div>
          <Button
            onClick={() => void changePassword()}
            disabled={changing || !oldPwd || !newPwd || !confirmPwd}
            className="self-start"
          >
            <KeyRound className="size-4" />
            {changing ? "Speichern…" : "Passwort ändern"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.section.legal")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <a href="/legal/privacy" className="text-primary-600 hover:underline">Datenschutz</a>
          <a href="/legal/terms" className="text-primary-600 hover:underline">Nutzungsbedingungen</a>
          <a href="/legal/impressum" className="text-primary-600 hover:underline">Impressum</a>
        </CardContent>
      </Card>

      <DeleteAccountCard />
    </div>
  );
}
