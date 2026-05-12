"use client";

import { useCallback } from "react";
import { useLocaleStore } from "@/stores/locale-store";
import { dictionaries } from "./dictionaries";

type Vars = Record<string, string | number>;

export function useTranslate() {
  const locale = useLocaleStore((s) => s.locale);

  return useCallback(
    (key: string, vars?: Vars, fallback?: string): string => {
      const dict = dictionaries[locale] ?? {};
      const template = dict[key] ?? dictionaries.de[key] ?? fallback ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        template,
      );
    },
    [locale],
  );
}
