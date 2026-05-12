"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { profileApi } from "@/lib/api";
import { RTL_LOCALES, type SupportedLocale } from "@/lib/types";

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale, opts?: { persistRemote?: boolean }) => Promise<void>;
  applyToDocument: () => void;
}

function detectDeviceLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return "de";
  const tag = (navigator.language || "de").slice(0, 2);
  if (tag === "fr" || tag === "ar") return tag;
  return "de";
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: detectDeviceLocale(),

      setLocale: async (locale, { persistRemote = false } = {}) => {
        set({ locale });
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
          document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
        }
        if (persistRemote) {
          try {
            await profileApi.setLocale(locale);
          } catch {
            // best-effort
          }
        }
      },

      applyToDocument: () => {
        const locale = get().locale;
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
          document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
        }
      },
    }),
    {
      name: "bewerbi.locale",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.applyToDocument(),
    },
  ),
);
