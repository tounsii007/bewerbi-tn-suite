import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Check, FileCheck2, Plane, Calendar, Building2 } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import {
  visaApi,
  IS_API_MODE,
  type VisaCase,
  type VisaType,
} from "../../src/lib/apiClient";

const VISA_TYPES: { key: VisaType; labelKey: string }[] = [
  { key: "BLUE_CARD", labelKey: "visa.blueCard" },
  { key: "SKILLED_WORKER_VOCATIONAL", labelKey: "visa.skilledVocational" },
  { key: "SKILLED_WORKER_ACADEMIC", labelKey: "visa.skilledAcademic" },
  { key: "VOCATIONAL_TRAINING", labelKey: "visa.vocationalTraining" },
  { key: "STUDY", labelKey: "visa.study" },
  { key: "JOB_SEEKER", labelKey: "visa.jobSeeker" },
  { key: "RECOGNITION", labelKey: "visa.recognition" },
  { key: "CHANCENKARTE", labelKey: "visa.chancenkarte" },
];

export default function VisaScreen() {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const [caseData, setCaseData] = useState<VisaCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!IS_API_MODE) {
        setLoading(false);
        return;
      }
      try {
        const data = await visaApi.me();
        setCaseData(data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const start = async (visaType: VisaType) => {
    if (IS_API_MODE) {
      try {
        const data = await visaApi.create({ visaType });
        setCaseData(data);
        return;
      } catch {}
    }
    setCaseData(buildMockCase(visaType));
  };

  const toggle = async (id: string) => {
    if (!caseData) return;
    if (IS_API_MODE) {
      try {
        const updated = await visaApi.toggleRequirement(id);
        setCaseData(updated);
        return;
      } catch {}
    }
    const next = caseData.requirements.map((r) =>
      r.id === id
        ? {
            ...r,
            completed: !r.completed,
            completedAt: !r.completed ? new Date().toISOString() : undefined,
          }
        : r,
    );
    const required = next.filter((r) => r.required);
    const done = required.filter((r) => r.completed).length;
    setCaseData({
      ...caseData,
      requirements: next,
      progressPercent:
        required.length === 0 ? 0 : Math.round((100 * done) / required.length),
    });
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="px-5 pt-4 pb-4">
        <View className="flex-row items-center gap-2">
          <Plane size={24} color="#2563EB" />
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-dark-text" : "text-gray-900"
            }`}
          >
            {t("visa.title")}
          </Text>
        </View>
        <Text
          className={`text-[13px] mt-1 ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          {t("visa.subtitle")}
        </Text>
      </View>

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
          <VisaTypeSelector onPick={start} isDark={isDark} />
        ) : (
          <VisaCaseView caseData={caseData} onToggle={toggle} isDark={isDark} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function VisaTypeSelector({
  onPick,
  isDark,
}: {
  onPick: (v: VisaType) => void;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeInDown.springify()}>
      <Text
        className={`text-[13px] font-semibold uppercase tracking-wider mb-3 ${
          isDark ? "text-dark-muted" : "text-gray-400"
        }`}
      >
        {t("visa.chooseType")}
      </Text>
      <View className="gap-2.5 pb-8">
        {VISA_TYPES.map((v) => (
          <TouchableOpacity
            key={v.key}
            onPress={() => onPick(v.key)}
            className={`rounded-2xl px-4 py-4 border ${
              isDark ? "border-dark-border bg-dark-card" : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`text-[15px] font-bold ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t(v.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

function VisaCaseView({
  caseData,
  onToggle,
  isDark,
}: {
  caseData: VisaCase;
  onToggle: (id: string) => void;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const required = caseData.requirements.filter((r) => r.required);
  const done = required.filter((r) => r.completed).length;
  return (
    <View className="pb-8">
      <View
        className={`rounded-2xl p-4 border ${
          isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
        }`}
      >
        <Text
          className={`text-[13px] font-semibold ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          {formatVisaType(caseData.visaType)}
        </Text>
        {caseData.embassyCity ? (
          <View className="flex-row items-center gap-2 mt-2">
            <Building2 size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
            <Text className={isDark ? "text-dark-text" : "text-gray-900"}>
              {caseData.embassyCity}
            </Text>
          </View>
        ) : null}
        {caseData.appointmentDate ? (
          <View className="flex-row items-center gap-2 mt-1">
            <Calendar size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
            <Text className={isDark ? "text-dark-text" : "text-gray-900"}>
              {caseData.appointmentDate}
            </Text>
          </View>
        ) : null}
        <View className="mt-3">
          <View className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-dark-border" : "bg-gray-200"}`}>
            <View
              className="h-full bg-primary-500"
              style={{ width: `${caseData.progressPercent}%` }}
            />
          </View>
          <Text className="text-[11px] mt-1 font-semibold text-primary-600">
            {t("visa.requirementsDone", { done, total: required.length })}
          </Text>
        </View>
      </View>

      <View className="mt-5 gap-3">
        {caseData.requirements.map((r, i) => (
          <Animated.View key={r.id} entering={FadeInDown.delay(i * 30).springify()}>
            <TouchableOpacity
              onPress={() => onToggle(r.id)}
              className={`rounded-2xl p-4 border flex-row gap-3 ${
                r.completed
                  ? "bg-success-50 border-success-500"
                  : !r.required
                    ? isDark
                      ? "border-dark-border bg-dark-bg"
                      : "border-gray-200 bg-gray-50"
                    : isDark
                      ? "border-dark-border bg-dark-card"
                      : "border-gray-200 bg-white"
              }`}
            >
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  r.completed
                    ? "bg-success-500"
                    : isDark
                      ? "bg-dark-border"
                      : "bg-gray-100"
                }`}
              >
                {r.completed ? (
                  <Check size={14} color="#fff" />
                ) : (
                  <FileCheck2 size={14} color={isDark ? "#94a3b8" : "#9ca3af"} />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`font-bold text-[14px] ${
                      r.completed
                        ? "text-success-700"
                        : isDark
                          ? "text-dark-text"
                          : "text-gray-900"
                    }`}
                  >
                    {r.title}
                  </Text>
                  {!r.required ? (
                    <Text
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isDark ? "bg-dark-border text-dark-muted" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      optional
                    </Text>
                  ) : null}
                </View>
                {r.description ? (
                  <Text
                    className={`text-[12px] mt-1 leading-5 ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    {r.description}
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

function formatVisaType(t: VisaType): string {
  const map: Record<VisaType, string> = {
    BLUE_CARD: "Blaue Karte EU (§18b AufenthG)",
    SKILLED_WORKER_VOCATIONAL: "Fachkraft mit Berufsausbildung (§18a)",
    SKILLED_WORKER_ACADEMIC: "Fachkraft mit akademischer Ausbildung (§18b)",
    VOCATIONAL_TRAINING: "Ausbildungsvisum (§16a)",
    STUDY: "Studienvisum (§16b)",
    JOB_SEEKER: "Visum zur Jobsuche (§20)",
    RECOGNITION: "Anerkennung der Berufsqualifikation (§16d)",
    CHANCENKARTE: "Chancenkarte (§20a)",
  };
  return map[t];
}

function buildMockCase(visaType: VisaType): VisaCase {
  const mk = (i: number, title: string, description: string, required = true) => ({
    id: `r${i}`,
    title,
    description,
    required,
    sortOrder: i,
    completed: false,
  });
  const base = [
    mk(1, "Gültiger Reisepass", "Mind. 6 Monate gültig nach Einreise."),
    mk(2, "Biometrische Passfotos", "Zwei aktuelle biometrische Fotos."),
    mk(3, "Visumsantrag (Videx)", "videx.diplo.de ausfüllen und mitbringen."),
    mk(4, "Krankenversicherung", "Auslandskrankenversicherung oder deutsche KV."),
  ];
  const more: ReturnType<typeof mk>[] = [];
  if (visaType === "BLUE_CARD") {
    more.push(mk(5, "Arbeitsvertrag mit Mindestgehalt", "≥ 45.300 € Brutto (2024)."));
    more.push(mk(6, "Hochschulabschluss anerkannt", "Über anabin H+ oder dt. Anerkennung."));
  }
  if (visaType === "STUDY") {
    more.push(mk(5, "Zulassung der Hochschule", "Uni-Assist bzw. Hochschule."));
    more.push(mk(6, "Sperrkonto 11.904 €", "Finanzierungsnachweis für 1 Jahr."));
  }
  if (visaType === "VOCATIONAL_TRAINING") {
    more.push(mk(5, "Ausbildungsvertrag", "Vertrag mit dt. Einrichtung."));
    more.push(mk(6, "Deutsch B1", "Anerkanntes Zertifikat."));
  }
  const all = [...base, ...more];
  return {
    id: "mock",
    visaType,
    stage: "PREPARATION",
    progressPercent: 0,
    requirements: all,
  };
}
