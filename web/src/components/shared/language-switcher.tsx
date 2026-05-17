"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Globe } from "lucide-react";
import { useLocaleStore } from "@/stores/locale-store";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/types";
import { cn } from "@/lib/cn";

interface LangOption {
  code: SupportedLocale;
  flag: string;
  native: string;
  english: string;
  rtl: boolean;
}

const OPTIONS: LangOption[] = [
  { code: "de", flag: "🇩🇪", native: "Deutsch", english: "German", rtl: false },
  { code: "fr", flag: "🇫🇷", native: "Français", english: "French", rtl: false },
  { code: "ar", flag: "🇹🇳", native: "العربية", english: "Arabic", rtl: true },
];

export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  // The non-null assertion is safe: OPTIONS is a non-empty literal,
  // so OPTIONS[0] is always defined. noUncheckedIndexedAccess can't
  // model that, so we narrow explicitly.
  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0]!;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-dark-bg"
        aria-label="Sprache ändern"
      >
        <Globe className="size-4 text-gray-500" />
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.native}</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-gray-100 bg-white p-1 shadow-[var(--shadow-lg)] dark:border-dark-border dark:bg-dark-card"
        >
          {SUPPORTED_LOCALES.map((code) => {
            const opt = OPTIONS.find((o) => o.code === code)!;
            const active = code === locale;
            return (
              <DropdownMenu.Item
                key={code}
                onSelect={() => void setLocale(code, { persistRemote: true })}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none",
                  active
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-bg",
                )}
              >
                <span className="text-lg">{opt.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold">{opt.native}</div>
                  <div className="text-[11px] text-gray-500 dark:text-dark-muted">
                    {opt.english}
                    {opt.rtl ? " · RTL" : ""}
                  </div>
                </div>
                {active && <Check className="size-4" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
