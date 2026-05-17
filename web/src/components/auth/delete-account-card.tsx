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
import { useTranslate } from "@/i18n/use-translate";

/**
 * Destructive-action card for /settings. Two-step UX:
 *   1) "Konto löschen" button reveals the password + a confirm phrase.
 *   2) The password is sent to POST /me/delete; on success the auth
 *      state is cleared and the browser is routed to /login.
 *
 * The confirm-phrase is a UX speed-bump so the user can't accidentally
 * delete by muscle memory. It's NOT a security control — the password
 * re-entry is.
 */
export function DeleteAccountCard() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const toastApiError = useApiErrorToast();
  const t = useTranslate();
  const [opened, setOpened] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // Confirm phrase is localised — "LÖSCHEN" in DE, "SUPPRIMER" in FR,
  // "حذف" in AR — so the user types something natural in their language.
  const confirmPhrase = t("account.delete.confirmPhrase");
  const canSubmit =
    password.length > 0 && confirm.trim() === confirmPhrase && !busy;

  const onDelete = async () => {
    setBusy(true);
    try {
      await authApi.deleteAccount(password);
      toast.success(t("account.delete.success"));
      await signOut();
      router.replace("/login");
    } catch (e) {
      toastApiError(e, t("account.delete.failure"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-accent-300 dark:border-accent-500/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent-700 dark:text-accent-400">
          <Trash2 className="size-5" /> {t("account.delete.title")}
        </CardTitle>
        <CardDescription>
          {t("account.delete.warning")}
          {user?.email ? ` (${user.email})` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!opened ? (
          <Button
            variant="destructive"
            className="self-start"
            onClick={() => setOpened(true)}
          >
            <Trash2 className="size-4" /> {t("account.delete.title")}
          </Button>
        ) : (
          <>
            <div className="flex items-start gap-2 rounded-xl border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-900 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{t("account.delete.warning")}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">
                {t("account.delete.passwordLabel")}
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
                {t("account.delete.confirmLabel", { phrase: confirmPhrase })}
              </label>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={confirmPhrase}
                aria-describedby="delete-confirm-help"
              />
              <p id="delete-confirm-help" className="mt-1 text-xs text-gray-500 dark:text-dark-muted">
                {t("account.delete.confirmHelp")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={!canSubmit}
                onClick={() => void onDelete()}
              >
                {busy ? t("account.delete.busy") : t("account.delete.button")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpened(false);
                  setPassword("");
                  setConfirm("");
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
