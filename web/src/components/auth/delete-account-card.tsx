"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";

/**
 * Destructive-action card for /settings. Two-step UX:
 *   1) "Konto löschen" button reveals the password + a confirm phrase.
 *   2) The password is sent to POST /me/delete; on success the auth
 *      state is cleared and the browser is routed to /login.
 *
 * The confirm-phrase ("LÖSCHEN") is a UX speed-bump so the user can't
 * accidentally delete by muscle memory. It's NOT a security control —
 * the password re-entry is.
 */
const CONFIRM_PHRASE = "LÖSCHEN";

export function DeleteAccountCard() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const toastApiError = useApiErrorToast();
  const [opened, setOpened] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = password.length > 0 && confirm === CONFIRM_PHRASE && !busy;

  const onDelete = async () => {
    setBusy(true);
    try {
      await authApi.deleteAccount(password);
      // Server already revoked every token. Mirror the change-password
      // pattern: clear local state and route to /login.
      toast.success("Konto gelöscht. Schade, dass du gehst.");
      await signOut();
      router.replace("/login");
    } catch (e) {
      toastApiError(e, "Löschen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-accent-300 dark:border-accent-500/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent-700 dark:text-accent-400">
          <Trash2 className="size-5" /> Konto löschen
        </CardTitle>
        <CardDescription>
          Permanente, unwiderrufliche Löschung deines bewerbi.tn-Kontos
          {user?.email ? ` (${user.email})` : ""} und aller verknüpften Daten.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!opened ? (
          <Button
            variant="destructive"
            className="self-start"
            onClick={() => setOpened(true)}
          >
            <Trash2 className="size-4" /> Konto löschen
          </Button>
        ) : (
          <>
            <div className="flex items-start gap-2 rounded-xl border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-900 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                Diese Aktion kann nicht rückgängig gemacht werden.
                Profil, Bewerbungen, Favoriten und Anerkennungs-Cases
                werden entfernt.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
                Passwort zur Bestätigung
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
                Tippe <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-dark-card">{CONFIRM_PHRASE}</code>{" "}
                zur Bestätigung
              </label>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                aria-describedby="delete-confirm-help"
              />
              <p id="delete-confirm-help" className="mt-1 text-xs text-gray-500 dark:text-dark-muted">
                Schutz vor versehentlichem Klick.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={!canSubmit}
                onClick={() => void onDelete()}
              >
                {busy ? "Lösche…" : "Endgültig löschen"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpened(false);
                  setPassword("");
                  setConfirm("");
                }}
              >
                Abbrechen
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
