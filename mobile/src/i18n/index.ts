import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { I18nManager, Platform } from "react-native";
import de from "./de.json";
import ar from "./ar.json";
import fr from "./fr.json";

export const SUPPORTED_LANGUAGES = ["de", "fr", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const RTL_LANGUAGES: SupportedLanguage[] = ["ar"];

const deviceLanguage = (getLocales()[0]?.languageCode || "de") as string;
const initialLang: SupportedLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(
  deviceLanguage,
)
  ? (deviceLanguage as SupportedLanguage)
  : "de";

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng: initialLang,
  fallbackLng: "de",
  interpolation: { escapeValue: false },
});

export function isRtl(lang: string = i18n.language): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(lang as SupportedLanguage);
}

/**
 * Switch language and apply RTL/LTR direction.
 * - Web: sets <html dir="..."> which flips Tailwind/layout.
 * - Native: I18nManager.forceRTL — takes effect after app reload.
 */
export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  const rtl = isRtl(lang);
  if (Platform.OS === "web") {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", lang);
    }
  } else if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

if (Platform.OS === "web" && typeof document !== "undefined") {
  document.documentElement.setAttribute("dir", isRtl(initialLang) ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", initialLang);
}

export default i18n;
