import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "../../../src/stores/authStore";
import { IS_API_MODE } from "../../../src/lib/apiClient";

/**
 * Iter 191 — settings layout fires authStore.refreshAccount() on
 * mount so all sub-screens (index, linked-accounts, sessions,
 * activity, change-password, delete-account) see fresh user flags
 * — hasPassword + hasGoogleLinked from /me/account.
 *
 * Previously only linked-accounts.tsx refreshed, which meant a
 * user landing directly on /(settings)/change-password from
 * deep-link wouldn't see the up-to-date "this account is OAuth-
 * only, no password to change" state until they navigated to
 * linked-accounts and back.
 *
 * Layout-level useEffect runs once per Settings-tab entry, not
 * per sub-screen navigation — so we don't thrash /me/account on
 * a back-and-forth between settings screens.
 */
export default function SettingsLayout() {
  const refreshAccount = useAuthStore((s) => s.refreshAccount);
  useEffect(() => {
    if (IS_API_MODE) void refreshAccount();
  }, [refreshAccount]);
  return <Stack screenOptions={{ headerShown: false }} />;
}
