import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n";
import i18n from "../i18n";

const STORAGE_KEY = "bewerbi.language";

/**
 * Persisted language preference.
 *
 * Order of precedence:
 * 1. User-picked language from storage
 * 2. Device locale (handled by i18n initialisation)
 * 3. "de" fallback
 */
export function useLanguagePreference() {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    i18n.language as SupportedLanguage,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
          await setLanguage(stored as SupportedLanguage);
          setLanguageState(stored as SupportedLanguage);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const change = useCallback(async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return { language, setLanguage: change, ready };
}
