import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Check, Building2, GraduationCap } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { GradientText } from "../../src/components/ui/GradientText";
import { anerkennungApi, IS_API_MODE, type AnerkennungCase } from "../../src/lib/apiClient";

export default function AnerkennungScreen() {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const [caseData, setCaseData] = useState<AnerkennungCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [profession, setProfession] = useState("");
  const [regulation, setRegulation] = useState<"REGULATED" | "NON_REGULATED" | "UNKNOWN">("UNKNOWN");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      if (!IS_API_MODE) {
        setLoading(false);
        return;
      }
      try {
        const data = await anerkennungApi.me();
        setCaseData(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const start = async () => {
    if (!profession.trim()) return;
    setCreating(true);
    try {
      if (IS_API_MODE) {
        const data = await anerkennungApi.create({
          profession: profession.trim(),
          regulationType: regulation,
        });
        setCaseData(data);
      } else {
        setCaseData(buildMockCase(profession.trim(), regulation));
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleStep = async (stepId: string) => {
    if (!caseData) return;
    if (IS_API_MODE) {
      try {
        const updated = await anerkennungApi.toggleStep(stepId);
        setCaseData(updated);
        return;
      } catch {
        // fall through to local toggle
      }
    }
    setCaseData({
      ...caseData,
      steps: caseData.steps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined } : s,
      ),
      progressPercent: computeProgress({
        ...caseData,
        steps: caseData.steps.map((s) =>
          s.id === stepId ? { ...s, completed: !s.completed } : s,
        ),
      }),
    });
  };

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Header isDark={isDark} />
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text
              className={`text-center mt-10 ${
                isDark ? "text-dark-muted" : "text-gray-400"
              }`}
            >
              {t("common.loading")}
            </Text>
          ) : !caseData ? (
            <SetupForm
              profession={profession}
              setProfession={setProfession}
              regulation={regulation}
              setRegulation={setRegulation}
              onStart={start}
              creating={creating}
              isDark={isDark}
            />
          ) : (
            <CaseView caseData={caseData} onToggle={toggleStep} isDark={isDark} />
          )}
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}

function Header({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInDown.springify()} className="px-5 pt-4 pb-3">
      <View className="flex-row items-start gap-3">
        <LinearGradient
          colors={["#16a34a", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#16a34a",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <GraduationCap size={24} color="white" />
        </LinearGradient>
        <View className="flex-1">
          <GradientText
            variant="brand"
            style={{ fontSize: 24, fontWeight: "800", lineHeight: 28 }}
          >
            {t("anerkennung.title")}
          </GradientText>
          <Text
            className={`text-[13px] mt-1 ${
              isDark ? "text-dark-muted" : "text-gray-600"
            }`}
          >
            {t("anerkennung.subtitle")}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function SetupForm({
  profession,
  setProfession,
  regulation,
  setRegulation,
  onStart,
  creating,
  isDark,
}: {
  profession: string;
  setProfession: (v: string) => void;
  regulation: "REGULATED" | "NON_REGULATED" | "UNKNOWN";
  setRegulation: (v: "REGULATED" | "NON_REGULATED" | "UNKNOWN") => void;
  onStart: () => void;
  creating: boolean;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInDown.springify()} className="gap-5">
      <View>
        <Text
          className={`text-[14px] font-semibold mb-2 ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
        >
          {t("anerkennung.professionQuestion")}
        </Text>
        <TextInput
          value={profession}
          onChangeText={setProfession}
          placeholder="z. B. Gesundheits- und Krankenpfleger/in"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          className={`rounded-2xl px-4 text-[15px] ${
            Platform.OS === "web" ? "py-3" : "py-4"
          } ${
            isDark
              ? "bg-dark-card border border-dark-border text-dark-text"
              : "bg-white border border-gray-200 text-gray-900"
          }`}
        />
      </View>

      <View>
        <Text
          className={`text-[14px] font-semibold mb-2 ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
        >
          {t("anerkennung.regulatedQuestion")}
        </Text>
        <View className="gap-2">
          {(
            [
              { k: "REGULATED", label: t("anerkennung.regulated"), hint: "z. B. Pflege, Ärzte, Lehrer" },
              { k: "NON_REGULATED", label: t("anerkennung.nonRegulated"), hint: "z. B. IT, Kaufmännisch" },
              { k: "UNKNOWN", label: t("anerkennung.unknown"), hint: "" },
            ] as const
          ).map((opt) => {
            const active = regulation === opt.k;
            return (
              <TouchableOpacity
                key={opt.k}
                onPress={() => setRegulation(opt.k)}
                className={`rounded-2xl px-4 py-3 border ${
                  active
                    ? "bg-primary-50 border-primary-500"
                    : isDark
                      ? "border-dark-border bg-dark-card"
                      : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-[15px] font-semibold ${
                    active ? "text-primary-700" : isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  {opt.label}
                </Text>
                {opt.hint ? (
                  <Text
                    className={`text-[12px] mt-0.5 ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    {opt.hint}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        onPress={onStart}
        disabled={!profession.trim() || creating}
        className={`rounded-2xl py-4 items-center ${
          !profession.trim() || creating ? "bg-gray-300" : "bg-primary-500"
        }`}
      >
        <Text className="text-white font-bold">{t("anerkennung.start")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CaseView({
  caseData,
  onToggle,
  isDark,
}: {
  caseData: AnerkennungCase;
  onToggle: (id: string) => void;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="pb-8">
      <View
        className={`rounded-2xl p-4 border ${
          isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
        }`}
      >
        <View className="flex-row items-center gap-2 mb-1">
          <Building2 size={16} color="#2563EB" />
          <Text className={`text-[13px] font-semibold ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
            {t("anerkennung.competentAuthority")}
          </Text>
        </View>
        <Text
          className={`text-[15px] font-bold ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
        >
          {caseData.competentAuthority || "—"}
        </Text>
        <Text
          className={`text-[13px] mt-1 ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          {caseData.profession}
        </Text>
        <View className="mt-3">
          <View className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-dark-border" : "bg-gray-200"}`}>
            <View
              className="h-full bg-success-500"
              style={{ width: `${caseData.progressPercent}%` }}
            />
          </View>
          <Text className="text-[11px] mt-1 font-semibold text-success-700">
            {t("anerkennung.progress", { percent: caseData.progressPercent })}
          </Text>
        </View>
      </View>

      <View className="mt-5 gap-3">
        {caseData.steps.map((s, i) => (
          <Animated.View key={s.id} entering={FadeInDown.delay(i * 40).springify()}>
            <TouchableOpacity
              onPress={() => onToggle(s.id)}
              className={`rounded-2xl p-4 border flex-row gap-3 ${
                s.completed
                  ? "bg-success-50 border-success-500"
                  : isDark
                    ? "border-dark-border bg-dark-card"
                    : "border-gray-200 bg-white"
              }`}
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  s.completed ? "bg-success-500" : isDark ? "bg-dark-border" : "bg-gray-100"
                }`}
              >
                {s.completed ? (
                  <Check size={16} color="#fff" />
                ) : (
                  <Text className={`font-bold ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold text-[15px] ${
                    s.completed
                      ? "text-success-700"
                      : isDark
                        ? "text-dark-text"
                        : "text-gray-900"
                  }`}
                >
                  {s.title}
                </Text>
                {s.description ? (
                  <Text
                    className={`text-[12px] mt-1 leading-5 ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    {s.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function computeProgress(c: AnerkennungCase): number {
  if (c.steps.length === 0) return 0;
  const done = c.steps.filter((s) => s.completed).length;
  return Math.round((100 * done) / c.steps.length);
}

function buildMockCase(profession: string, regulation: "REGULATED" | "NON_REGULATED" | "UNKNOWN"): AnerkennungCase {
  const mkStep = (i: number, title: string, description: string) => ({
    id: `m${i}`,
    title,
    description,
    sortOrder: i,
    completed: false,
  });
  return {
    id: `mcase`,
    profession,
    regulationType: regulation,
    competentAuthority:
      regulation === "REGULATED"
        ? "Zuständige Landesbehörde"
        : "IHK FOSA (Foreign Skills Approval)",
    stage: "INFORMATION",
    progressPercent: 0,
    steps: [
      mkStep(1, "Informationsgespräch ZAB / IHK FOSA", "Kostenlose Erstberatung zur Anerkennung."),
      mkStep(2, "Unterlagen zusammenstellen", "Zeugnisse, beglaubigte Übersetzungen, CV."),
      mkStep(3, "Antrag auf Anerkennung stellen", "Bei der zuständigen Stelle."),
      mkStep(4, "Gleichwertigkeitsprüfung abwarten", "ca. 3 Monate."),
      mkStep(5, "Ausgleichsmaßnahme (falls nötig)", "Anpassungslehrgang / Kenntnisprüfung."),
      mkStep(6, "Anerkennungsbescheid erhalten", "Voll / teilweise / keine Gleichwertigkeit."),
    ],
  };
}
