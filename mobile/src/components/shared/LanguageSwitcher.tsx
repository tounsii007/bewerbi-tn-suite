import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Check, Globe } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import { useLanguagePreference } from "../../hooks/useLanguagePreference";
import type { SupportedLanguage } from "../../i18n";

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  rtl: boolean;
}

const OPTIONS: LanguageOption[] = [
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪", rtl: false },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷", rtl: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇹🇳", rtl: true },
];

interface Props {
  variant?: "inline" | "button";
}

export function LanguageSwitcher({ variant = "button" }: Props) {
  const { isDark } = useThemeStore();
  const { language, setLanguage } = useLanguagePreference();
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];

  const pick = async (code: SupportedLanguage) => {
    await setLanguage(code);
    setOpen(false);
  };

  if (variant === "inline") {
    return (
      <View className="flex-row gap-2">
        {OPTIONS.map((opt) => {
          const active = opt.code === language;
          return (
            <TouchableOpacity
              key={opt.code}
              onPress={() => pick(opt.code)}
              className={`flex-row items-center gap-2 px-3 py-2 rounded-full border ${
                active
                  ? "bg-primary-500 border-primary-500"
                  : isDark
                    ? "border-dark-border bg-dark-card"
                    : "border-gray-200 bg-white"
              }`}
            >
              <Text className="text-base">{opt.flag}</Text>
              <Text
                className={`text-[13px] font-semibold ${
                  active ? "text-white" : isDark ? "text-dark-text" : "text-gray-800"
                }`}
              >
                {opt.nativeLabel}
              </Text>
              {active && <Check size={14} color="#fff" />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className={`flex-row items-center gap-2 px-3 py-2 rounded-full border ${
          isDark ? "border-dark-border bg-dark-card" : "border-gray-200 bg-white"
        }`}
      >
        <Globe size={16} color={isDark ? "#94a3b8" : "#6b7280"} />
        <Text className="text-base">{current.flag}</Text>
        <Text className={`text-[13px] font-semibold ${isDark ? "text-dark-text" : "text-gray-800"}`}>
          {current.nativeLabel}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 items-center justify-center bg-black/50 px-6">
          <Animated.View
            entering={FadeInUp.springify()}
            className={`w-full max-w-sm rounded-3xl p-5 ${isDark ? "bg-dark-card" : "bg-white"}`}
          >
            <Text className={`text-[15px] font-bold mb-3 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
              Sprache / Langue / اللغة
            </Text>
            {OPTIONS.map((opt, i) => {
              const active = opt.code === language;
              return (
                <Animated.View key={opt.code} entering={FadeIn.delay(i * 40)}>
                  <TouchableOpacity
                    onPress={() => pick(opt.code)}
                    className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl mb-1 ${
                      active
                        ? "bg-primary-50"
                        : isDark
                          ? "bg-dark-bg"
                          : "bg-gray-50"
                    }`}
                  >
                    <Text className="text-2xl">{opt.flag}</Text>
                    <View className="flex-1">
                      <Text
                        className={`text-[15px] font-bold ${
                          active ? "text-primary-700" : isDark ? "text-dark-text" : "text-gray-900"
                        }`}
                      >
                        {opt.nativeLabel}
                      </Text>
                      <Text className={`text-[11px] ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                        {opt.label}
                        {opt.rtl ? " · RTL" : ""}
                      </Text>
                    </View>
                    {active && <Check size={18} color="#2563EB" />}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}
