import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Upload, FileText, Check, Sparkles, Mail, Phone, Languages } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import {
  documentsApi,
  IS_API_MODE,
  type CvHints,
  type DocumentSummary,
} from "../../src/lib/apiClient";

export default function CvUploadScreen() {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState<DocumentSummary | null>(null);
  const [hints, setHints] = useState<CvHints | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    if (Platform.OS !== "web") {
      setError("Bitte die mobile App verwenden — Web-Upload folgt.");
      return;
    }
    const input = global.document?.createElement("input") as HTMLInputElement | undefined;
    if (!input) return;
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await handleUpload(file, file.name);
    };
    input.click();
  };

  const handleUpload = async (blob: Blob, name: string) => {
    setError(null);
    setUploading(true);
    try {
      if (IS_API_MODE) {
        const doc = await documentsApi.upload(blob, name, "CV");
        setDocument(doc);
        const extracted = await documentsApi.autofill(doc.id);
        setHints(extracted);
      } else {
        setDocument({
          id: "mock",
          type: "CV",
          name,
          contentType: "application/pdf",
          sizeBytes: blob.size,
          hasParsedText: true,
          createdAt: new Date().toISOString(),
        });
        setHints({
          email: "kandidat@example.tn",
          phone: "+216 12 345 678",
          germanLevel: "B2",
          skills: ["React", "TypeScript", "Flutter"],
          languages: ["Arabisch (Muttersprache)", "Französisch (C1)", "Deutsch (B2)"],
          education: ["Master Informatik, ISIMG Gabès, 2023"],
          experiences: ["Frontend Developer @ VermeoTech, 2023–heute"],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="px-5 pt-4 pb-4">
        <View className="flex-row items-center gap-2">
          <FileText size={24} color="#2563EB" />
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-dark-text" : "text-gray-900"
            }`}
          >
            {t("cv.upload")}
          </Text>
        </View>
      </View>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {!document && (
          <Animated.View entering={FadeInDown.springify()}>
            <TouchableOpacity
              onPress={pick}
              disabled={uploading}
              className={`rounded-3xl border-2 border-dashed py-10 items-center ${
                isDark ? "border-dark-border bg-dark-card" : "border-gray-200 bg-white"
              }`}
            >
              {uploading ? (
                <ActivityIndicator size="large" color="#2563EB" />
              ) : (
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
                    isDark ? "bg-primary-500/20" : "bg-primary-50"
                  }`}
                >
                  <Upload size={28} color="#2563EB" />
                </View>
              )}
              <Text
                className={`text-[15px] font-bold mb-1 ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                {uploading ? t("cv.parsing") : "PDF auswählen"}
              </Text>
              <Text
                className={`text-[12px] ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                Wir extrahieren Text und füllen dein Profil vor
              </Text>
            </TouchableOpacity>
            {error && (
              <Text className="text-center mt-3 text-accent-500 text-[13px]">
                {error}
              </Text>
            )}
          </Animated.View>
        )}

        {hints && <HintsView hints={hints} isDark={isDark} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function HintsView({ hints, isDark }: { hints: CvHints; isDark: boolean }) {
  const { t } = useTranslation();
  const nothingFound =
    !hints.email &&
    !hints.phone &&
    !hints.germanLevel &&
    hints.skills.length === 0 &&
    hints.languages.length === 0;

  return (
    <Animated.View entering={FadeInDown.springify()} className="mt-2 pb-8">
      <View className="flex-row items-center gap-2 mb-3">
        <Sparkles size={16} color="#2563EB" />
        <Text
          className={`text-[15px] font-bold ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
        >
          {t("cv.autofillTitle")}
        </Text>
      </View>
      <Text
        className={`text-[13px] mb-4 ${
          isDark ? "text-dark-muted" : "text-gray-500"
        }`}
      >
        {t("cv.autofillDescription")}
      </Text>

      {nothingFound ? (
        <Text className={isDark ? "text-dark-muted" : "text-gray-500"}>
          {t("cv.noHints")}
        </Text>
      ) : (
        <View className="gap-3">
          {hints.email && (
            <HintRow icon={<Mail size={16} color="#2563EB" />} label={t("cv.suggestedEmail")} value={hints.email} isDark={isDark} />
          )}
          {hints.phone && (
            <HintRow icon={<Phone size={16} color="#2563EB" />} label={t("cv.suggestedPhone")} value={hints.phone} isDark={isDark} />
          )}
          {hints.germanLevel && (
            <HintRow
              icon={<Languages size={16} color="#2563EB" />}
              label={t("cv.suggestedGerman")}
              value={hints.germanLevel}
              isDark={isDark}
            />
          )}
          {hints.skills.length > 0 && (
            <ChipRow title={t("cv.suggestedSkills")} items={hints.skills} isDark={isDark} />
          )}
          {hints.languages.length > 0 && (
            <ChipRow title={t("cv.suggestedLanguages")} items={hints.languages} isDark={isDark} />
          )}
        </View>
      )}

      <TouchableOpacity className="rounded-2xl py-4 items-center bg-primary-500 mt-6 flex-row justify-center gap-2">
        <Check size={18} color="#fff" />
        <Text className="text-white font-bold">{t("cv.applyAll")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function HintRow({
  icon, label, value, isDark,
}: { icon: React.ReactNode; label: string; value: string; isDark: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-2xl px-4 py-3 border ${
        isDark ? "border-dark-border bg-dark-card" : "border-gray-200 bg-white"
      }`}
    >
      <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-primary-500/20" : "bg-primary-50"}`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
          {label}
        </Text>
        <Text className={`text-[15px] font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ChipRow({ title, items, isDark }: { title: string; items: string[]; isDark: boolean }) {
  return (
    <View>
      <Text className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map((v) => (
          <View
            key={v}
            className={`px-3 py-1.5 rounded-full ${isDark ? "bg-primary-500/20" : "bg-primary-50"}`}
          >
            <Text className="text-primary-700 text-[13px] font-semibold">{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
