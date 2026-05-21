"use client";

import { create } from "zustand";
import { authApi } from "@/lib/api";
import {
  armRefreshTimer,
  disarmRefreshTimer,
  onLoginSuccess,
  setOnUnauthorized,
} from "@/lib/api-client";
import { clearTokens, readTokens } from "@/lib/auth-storage";
import type { AuthUser, UserRole } from "@/lib/types";

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "authenticating" | "authenticated" | "anonymous";
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (p: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => Promise<void>;
  /**
   * Iter 161 — exchange a Google ID token (obtained client-side from
   * Google's OAuth pop-up) for our JWT pair. `role` is only honoured
   * on signup — for existing users it's ignored.
   */
  signInWithGoogle: (idToken: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => void;
  setUser: (user: AuthUser | null) => void;
  /**
   * Iter 169 — re-fetch /me/account so hasPassword + hasGoogleLinked
   * flags refresh after link / unlink / set-initial-password. Doesn't
   * re-mint JWTs (the existing access token remains valid).
   */
  refreshAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // Wire the 401-handler once. Zustand guarantees the factory runs a single
  // time, so this is side-effect-safe.
  setOnUnauthorized(() => {
    clearTokens();
    set({ user: null, status: "anonymous" });
  });

  return {
    user: null,
    status: "idle",
    error: null,

    signIn: async (email, password) => {
      set({ status: "authenticating", error: null });
      try {
        const resp = await authApi.login({ email, password });
        onLoginSuccess(resp);
        set({ user: resp.user, status: "authenticated" });
      } catch (e) {
        const err = e as { message?: string };
        set({ status: "anonymous", error: err.message ?? "Login fehlgeschlagen" });
        throw e;
      }
    },

    signUp: async ({ email, password, firstName, lastName, role }) => {
      set({ status: "authenticating", error: null });
      try {
        const resp = await authApi.register({ email, password, firstName, lastName, role });
        onLoginSuccess(resp);
        set({ user: resp.user, status: "authenticated" });
      } catch (e) {
        const err = e as { message?: string };
        set({ status: "anonymous", error: err.message ?? "Registrierung fehlgeschlagen" });
        throw e;
      }
    },

    signInWithGoogle: async (idToken, role) => {
      set({ status: "authenticating", error: null });
      try {
        const resp = await authApi.google({ idToken, role });
        onLoginSuccess(resp);
        set({ user: resp.user, status: "authenticated" });
      } catch (e) {
        const err = e as { message?: string };
        set({
          status: "anonymous",
          error: err.message ?? "Google-Anmeldung fehlgeschlagen",
        });
        throw e;
      }
    },

    signOut: async () => {
      const tokens = readTokens();
      try {
        if (tokens?.refreshToken) await authApi.logout(tokens.refreshToken);
      } catch {
        // Logout is best-effort — still clear locally even if the call fails.
      }
      clearTokens();
      disarmRefreshTimer();
      set({ user: null, status: "anonymous" });
    },

    hydrate: () => {
      if (get().status !== "idle") return;
      const tokens = readTokens();
      if (!tokens) {
        set({ status: "anonymous" });
        return;
      }
      armRefreshTimer();
      set({
        user: {
          id: tokens.userId,
          email: tokens.email,
          role: tokens.role as UserRole,
          emailVerified: tokens.emailVerified,
          preferredLocale: tokens.preferredLocale as AuthUser["preferredLocale"],
          hasPassword: tokens.hasPassword,
          hasGoogleLinked: tokens.hasGoogleLinked,
        },
        status: "authenticated",
      });
    },

    setUser: (user) => set({ user }),

    refreshAccount: async () => {
      try {
        const account = await authApi.account();
        // Merge — preserve preferredLocale (server might not echo it
        // identically if the user changed it server-side, but for our
        // current backend it always does). Account-summary may also
        // omit transient fields; keep what we have for those.
        set((s) => ({
          user: s.user
            ? {
                ...s.user,
                email: account.email,
                role: account.role,
                emailVerified: account.emailVerified,
                preferredLocale: account.preferredLocale,
                hasPassword: account.hasPassword,
                hasGoogleLinked: account.hasGoogleLinked,
              }
            : s.user,
        }));
      } catch {
        // Best-effort — keep the cached flags if the round-trip fails.
      }
    },
  };
});
