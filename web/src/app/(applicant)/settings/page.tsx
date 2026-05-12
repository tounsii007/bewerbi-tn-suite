"use client";

import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api";

export default function SettingsPage() {
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const logoutAllDevices = async () => {
    try {
      await authApi.logoutAll();
      toast.success("Auf allen Geräten abgemeldet");
      await signOut();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Einstellungen</h1>

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
          <CardTitle>Konto</CardTitle>
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
          <CardTitle>Rechtliches</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <a href="/legal/privacy" className="text-primary-600 hover:underline">Datenschutz</a>
          <a href="/legal/terms" className="text-primary-600 hover:underline">Nutzungsbedingungen</a>
          <a href="/legal/impressum" className="text-primary-600 hover:underline">Impressum</a>
        </CardContent>
      </Card>
    </div>
  );
}
