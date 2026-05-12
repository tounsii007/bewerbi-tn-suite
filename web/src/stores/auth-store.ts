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
  signOut: () => Promise<void>;
  hydrate: () => void;
  setUser: (user: AuthUser | null) => void;
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
        },
        status: "authenticated",
      });
    },

    setUser: (user) => set({ user }),
  };
});
