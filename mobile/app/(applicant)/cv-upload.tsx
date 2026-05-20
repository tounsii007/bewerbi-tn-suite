import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Upload, FileText, Check, Sparkles, Mail, Phone, Languages, ShieldCheck } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { GradientText } from "../../src/components/ui/GradientText";
import { ShimmerButton } from "../../src/components/ui/ShimmerButton";
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
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Animated.View entering={FadeInDown.springify()} className="px-5 pt-4 pb-2">
          <View className="items-center mb-2">
            <LinearGradient
              colors={["#2563EB", "#6d4cf7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <FileText size={28} color="white" />
            </LinearGradient>
            <View className="items-center mt-3">
              <GradientText
                variant="brand"
                style={{ fontSize: 26, fontWeight: "800", lineHeight: 32 }}
              >
                CV hochladen
              </GradientText>
              <Text
                className={`text-[13px] text-center mt-1 px-6 leading-5 ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                Wir extrahieren E-Mail, Telefon, Deutsch-Niveau, Skills und
                Sprachen automatisch.
              </Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
          {!document && (
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <TouchableOpacity
                onPress={pick}
                disabled={uploading}
                activeOpacity={0.85}
              >
                <GlassCard
                  strength="default"
                  glow={!uploading}
                  style={{
                    padding: 32,
                    alignItems: "center",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: uploading ? "#2563EB" : "#bfdbfe",
                  }}
                >
                  {uploading ? (
                    <ActivityIndicator size="large" color="#2563EB" />
                  ) : (
                    <LinearGradient
                      colors={["#2563EB", "#6d4cf7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Upload size={32} color="white" />
                    </LinearGradient>
                  )}
                  <Text
                    className={`text-[16px] font-extrabold mt-4 ${
                      isDark ? "text-dark-text" : "text-gray-900"
                    }`}
                  >
                    {uploading ? "Analysiere Lebenslauf…" : "PDF auswählen"}
                  </Text>
                  <Text
                    className={`text-[12px] mt-1 text-center ${
                      isDark ? "text-dark-muted" : "text-gray-600"
                    }`}
                  >
                    PDF, max. 10 MB · DSGVO-konform
                  </Text>
                  {!uploading && (
                    <View className="flex-row items-center gap-3 mt-5">
                      <View className="flex-row items-center gap-1">
                        <ShieldCheck size={12} color="#16a34a" />
                        <Text className="text-[11px] text-success-500 font-bold">
                          Privat
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Sparkles size={12} color="#2563EB" />
                        <Text className="text-[11px] text-primary-500 font-bold">
                          KI-Auto-Fill
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Languages size={12} color="#DC2626" />
                        <Text className="text-[11px] text-accent-500 font-bold">
                          3 Sprachen
                        </Text>
                      </View>
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
              {error && (
                <View className="mt-3 rounded-xl bg-accent-500/10 px-4 py-3">
                  <Text className="text-accent-600 text-[13px] font-semibold text-center">
                    {error}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {hints && <HintsView hints={hints} doc={document} isDark={isDark} />}
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}

function HintsView({
  hints,
  doc,
  isDark,
}: {
  hints: CvHints;
  doc: DocumentSummary | null;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const nothingFound =
    !hints.email &&
    !hints.phone &&
    !hints.germanLevel &&
    hints.skills.length === 0 &&
    hints.languages.length === 0;

  return (
    <Animated.View entering={FadeInDown.springify()} className="mt-2 pb-8">
      {doc && (
        <GlassCard strength="strong" style={{ padding: 16, marginBottom: 16 }}>
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: "rgba(22, 163, 74, 0.15)" }}
            >
              <Check size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase text-success-500" style={{ letterSpacing: 0.6 }}>
                Hochgeladen
              </Text>
              <Text className={`text-[14px] font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                {doc.name}
              </Text>
            </View>
          </View>
        </GlassCard>
      )}

      <View className="flex-row items-center gap-2 mb-3">
        <Sparkles size={16} color="#2563EB" />
        <Text
          className={`text-[16px] font-bold ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
        >
          {t("cv.autofillTitle")}
        </Text>
      </View>
      <Text
        className={`text-[13px] mb-4 leading-5 ${
          isDark ? "text-dark-muted" : "text-gray-600"
        }`}
      >
        {t("cv.autofillDescription")}
      </Text>

      {nothingFound ? (
        <GlassCard strength="default" style={{ padding: 24, alignItems: "center" }}>
          <Text className={`text-center ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
            {t("cv.noHints")}
          </Text>
        </GlassCard>
      ) : (
        <View className="gap-3">
          {hints.email && (
            <HintRow
              icon={<Mail size={16} color="#2563EB" />}
              label={t("cv.suggestedEmail")}
              value={hints.email}
              isDark={isDark}
            />
          )}
          {hints.phone && (
            <HintRow
              icon={<Phone size={16} color="#2563EB" />}
              label={t("cv.suggestedPhone")}
              value={hints.phone}
              isDark={isDark}
            />
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

      <View className="mt-6">
        <ShimmerButton onPress={() => undefined} size="lg" style={{ width: "100%" }}>
          <View className="flex-row items-center gap-2">
            <Check size={18} color="white" />
            <Text className="text-white font-bold text-[15px]">
              {t("cv.applyAll")}
            </Text>
          </View>
        </ShimmerButton>
      </View>
    </Animated.View>
  );
}

function HintRow({
  icon,
  label,
  value,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <GlassCard strength="subtle" style={{ padding: 14 }}>
      <View className="flex-row items-center gap-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: "rgba(37, 99, 235, 0.15)" }}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text
            className={`text-[11px] font-bold uppercase ${
              isDark ? "text-dark-muted" : "text-gray-500"
            }`}
            style={{ letterSpacing: 0.6 }}
          >
            {label}
          </Text>
          <Text
            className={`text-[15px] font-semibold ${
              isDark ? "text-dark-text" : "text-gray-900"
            }`}
          >
            {value}
          </Text>
        </View>
        <Text className="text-success-500 text-[11px] font-bold">✓ Erkannt</Text>
      </View>
    </GlassCard>
  );
}

function ChipRow({
  title,
  items,
  isDark,
}: {
  title: string;
  items: string[];
  isDark: boolean;
}) {
  return (
    <GlassCard strength="subtle" style={{ padding: 14 }}>
      <Text
        className={`text-[11px] font-bold uppercase mb-2 ${
          isDark ? "text-dark-muted" : "text-gray-500"
        }`}
        style={{ letterSpacing: 0.6 }}
      >
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map((v) => (
          <View
            key={v}
            className={`px-3 py-1.5 rounded-full ${
              isDark ? "bg-primary-500/20" : "bg-primary-500/10"
            }`}
          >
            <Text className="text-primary-700 text-[13px] font-bold">{v}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}
