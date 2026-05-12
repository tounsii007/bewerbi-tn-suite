"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  applyToDocument: () => void;
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: Theme): "light" | "dark" {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolved: "light",
      setTheme: (theme) => {
        const resolved = resolve(theme);
        set({ theme, resolved });
        if (typeof document !== "undefined") {
          document.documentElement.dataset.theme = resolved;
        }
      },
      applyToDocument: () => {
        const resolved = resolve(get().theme);
        set({ resolved });
        if (typeof document !== "undefined") {
          document.documentElement.dataset.theme = resolved;
        }
      },
    }),
    {
      name: "bewerbi.theme",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.applyToDocument(),
    },
  ),
);
