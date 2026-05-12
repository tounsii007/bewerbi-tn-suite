import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import { searchProfessions, professionByLabel } from "../../lib/professions";
import type { LanguageLevel } from "../../types";

export interface OnboardingResult {
  desiredProfession: string;
  germanLevel: LanguageLevel | null;
  recognitionStatus: RecognitionStatus | null;
  skills: string[];
}

export type RecognitionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PARTIALLY_RECOGNIZED"
  | "FULLY_RECOGNIZED"
  | "NOT_REQUIRED";

interface Props {
  onComplete: (result: OnboardingResult) => void;
  onSkip?: () => void;
}

const LEVELS: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const RECOGNITION_OPTIONS: { key: RecognitionStatus; labelKey: string }[] = [
  { key: "NOT_STARTED", labelKey: "onboarding.step3NotStarted" },
  { key: "IN_PROGRESS", labelKey: "onboarding.step3InProgress" },
  { key: "PARTIALLY_RECOGNIZED", labelKey: "onboarding.step3Partial" },
  { key: "FULLY_RECOGNIZED", labelKey: "onboarding.step3Full" },
  { key: "NOT_REQUIRED", labelKey: "onboarding.step3NotRequired" },
];

type Step = "profession" | "level" | "recognition" | "skills" | "done";

export function OnboardingQuiz({ onComplete, onSkip }: Props) {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [profession, setProfession] = useState("");
  const [level, setLevel] = useState<LanguageLevel | null>(null);
  const [recognition, setRecognition] = useState<RecognitionStatus | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const entry = useMemo(() => professionByLabel(profession), [profession]);
  const suggestions = useMemo(() => searchProfessions(profession), [profession]);

  const steps: Step[] = useMemo(() => {
    const base: Step[] = ["profession", "level"];
    if (entry?.regulated !== false) base.push("recognition");
    base.push("skills");
    base.push("done");
    return base;
  }, [entry]);

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const total = steps.length - 1;
  const progress = Math.min(stepIndex, total) / total;

  const canContinue =
    (current === "profession" && profession.trim().length > 1) ||
    (current === "level" && level !== null) ||
    (current === "recognition" && recognition !== null) ||
    current === "skills" ||
    current === "done";

  const next = () => {
    if (current === "done") {
      onComplete({
        desiredProfession: profession.trim(),
        germanLevel: level,
        recognitionStatus: recognition,
        skills,
      });
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  const pickProfession = (label: string) => {
    setProfession(label);
    const match = professionByLabel(label);
    if (match && skills.length === 0) {
      setSkills(match.skills.slice(0, 5));
    }
  };

  const addSkill = (value?: string) => {
    const v = (value ?? skillInput).trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  return (
    <View className="flex-1">
      <View className={`px-5 pt-4 pb-3 ${isDark ? "bg-dark-bg" : "bg-white"}`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text
              className={`text-xl font-bold ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("onboarding.title")}
            </Text>
            <Text
              className={`text-[13px] mt-0.5 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {t("onboarding.subtitle")}
            </Text>
          </View>
          {onSkip && current !== "done" && (
            <TouchableOpacity onPress={onSkip}>
              <Text className="text-primary-500 text-[13px] font-semibold">
                {t("common.skip")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          className={`h-1.5 rounded-full overflow-hidden ${
            isDark ? "bg-dark-border" : "bg-gray-200"
          }`}
        >
          <Animated.View
            entering={FadeIn}
            className="h-full bg-primary-500"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? "text-dark-muted" : "text-gray-400"
            }`}
          >
            Schritt {Math.min(stepIndex + 1, total)} / {total}
          </Text>
          {stepIndex > 0 && current !== "done" && (
            <TouchableOpacity
              onPress={back}
              className="flex-row items-center gap-1"
            >
              <ChevronLeft size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
              <Text
                className={`text-[12px] font-semibold ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                {t("common.back")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {current === "profession" && (
          <Animated.View entering={FadeInDown.springify()} key="profession">
            <Text
              className={`text-lg font-bold mb-2 ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("onboarding.step1Title")}
            </Text>
            <Text
              className={`text-[13px] mb-4 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {t("onboarding.step1Hint")}
            </Text>
            <TextInput
              value={profession}
              onChangeText={setProfession}
              placeholder={t("onboarding.step1Placeholder")}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              autoFocus
              className={`rounded-2xl px-4 text-[15px] ${
                Platform.OS === "web" ? "py-3" : "py-4"
              } ${
                isDark
                  ? "bg-dark-card border border-dark-border text-dark-text"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            />
            {suggestions.length > 0 && (
              <View className="mt-3 gap-1.5">
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.de}
                    onPress={() => pickProfession(s.de)}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-2xl ${
                      isDark ? "bg-dark-card" : "bg-gray-50"
                    }`}
                  >
                    <Text
                      className={`text-[14px] ${
                        isDark ? "text-dark-text" : "text-gray-800"
                      }`}
                    >
                      {s.de}
                    </Text>
                    {s.regulated && (
                      <View className="bg-warning-100 rounded-full px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-warning-700">
                          reglementiert
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {entry && (
              <Animated.View
                entering={FadeIn}
                className={`mt-3 rounded-2xl px-4 py-3 flex-row items-start gap-2 ${
                  entry.regulated ? "bg-warning-50" : "bg-primary-50"
                }`}
              >
                <Sparkles
                  size={16}
                  color={entry.regulated ? "#92400e" : "#2563EB"}
                />
                <Text
                  className={`text-[12px] flex-1 leading-5 ${
                    entry.regulated ? "text-warning-700" : "text-primary-700"
                  }`}
                >
                  {entry.regulated
                    ? "Reglementierter Beruf — Anerkennung zwingend nötig."
                    : "Nicht reglementiert — Anerkennung ist optional."}
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {current === "level" && (
          <Animated.View entering={FadeInDown.springify()} key="level">
            <Text
              className={`text-lg font-bold mb-2 ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("onboarding.step2Title")}
            </Text>
            <Text
              className={`text-[13px] mb-6 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {t("onboarding.step2Hint")}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {LEVELS.map((l) => {
                const active = l === level;
                return (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setLevel(l)}
                    className={`w-[30%] aspect-square rounded-2xl items-center justify-center border-2 ${
                      active
                        ? "bg-primary-500 border-primary-500"
                        : isDark
                          ? "border-dark-border bg-dark-card"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-2xl font-bold ${
                        active
                          ? "text-white"
                          : isDark
                            ? "text-dark-text"
                            : "text-gray-900"
                      }`}
                    >
                      {l}
                    </Text>
                    <Text
                      className={`text-[11px] mt-1 ${
                        active
                          ? "text-white/80"
                          : isDark
                            ? "text-dark-muted"
                            : "text-gray-500"
                      }`}
                    >
                      {l.startsWith("A")
                        ? "Anfänger"
                        : l.startsWith("B")
                          ? "Fortgeschr."
                          : "Fließend"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {current === "recognition" && (
          <Animated.View entering={FadeInDown.springify()} key="recognition">
            <Text
              className={`text-lg font-bold mb-2 ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("onboarding.step3Title")}
            </Text>
            <Text
              className={`text-[13px] mb-4 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {t("onboarding.step3Hint")}
            </Text>
            <View className="gap-2.5">
              {RECOGNITION_OPTIONS.map((opt) => {
                const active = opt.key === recognition;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setRecognition(opt.key)}
                    className={`flex-row items-center justify-between rounded-2xl px-4 py-4 border ${
                      active
                        ? "bg-primary-50 border-primary-500"
                        : isDark
                          ? "border-dark-border bg-dark-card"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[15px] font-semibold ${
                        active
                          ? "text-primary-700"
                          : isDark
                            ? "text-dark-text"
                            : "text-gray-900"
                      }`}
                    >
                      {t(opt.labelKey)}
                    </Text>
                    {active && <Check size={20} color="#2563EB" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {current === "skills" && (
          <Animated.View entering={FadeInDown.springify()} key="skills">
            <Text
              className={`text-lg font-bold mb-2 ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("onboarding.step4Title")}
            </Text>
            <Text
              className={`text-[13px] mb-4 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {t("onboarding.step4Hint")}
            </Text>
            <TextInput
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={() => addSkill()}
              returnKeyType="done"
              placeholder="React, Altenpflege, LKW-Führerschein…"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className={`rounded-2xl px-4 text-[15px] mb-3 ${
                Platform.OS === "web" ? "py-3" : "py-4"
              } ${
                isDark
                  ? "bg-dark-card border border-dark-border text-dark-text"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            />
            {entry?.skills && (
              <View className="mb-4">
                <Text
                  className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  Vorschläge für {entry.de}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {entry.skills
                    .filter((s) => !skills.includes(s))
                    .map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => addSkill(s)}
                        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                          isDark ? "border-dark-border" : "border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-[12px] ${
                            isDark ? "text-dark-text" : "text-gray-700"
                          }`}
                        >
                          + {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
            <View className="flex-row flex-wrap gap-2">
              {skills.map((s) => (
                <Animated.View
                  key={s}
                  entering={ZoomIn}
                  className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    isDark ? "bg-primary-500/20" : "bg-primary-50"
                  }`}
                >
                  <Text className="text-primary-700 font-semibold text-[13px]">
                    {s}
                  </Text>
                  <TouchableOpacity onPress={() => removeSkill(s)}>
                    <X size={14} color="#2563EB" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {current === "done" && (
          <Animated.View
            entering={FadeInUp.springify()}
            className="items-center pt-6"
          >
            <Animated.Text entering={ZoomIn} className="text-[80px] mb-4">
              🎉
            </Animated.Text>
            <Text
              className={`text-2xl font-bold mb-3 text-center ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("onboarding.finished")}
            </Text>
            <Text
              className={`text-center text-[14px] leading-6 max-w-md ${
                isDark ? "text-dark-muted" : "text-gray-600"
              }`}
            >
              Wir zeigen dir jetzt Stellen, die zu{" "}
              <Text className="font-bold">{profession}</Text>,{" "}
              <Text className="font-bold">{level}</Text> Deutsch
              {skills.length > 0 ? ` und ${skills.length} Kompetenzen` : ""}{" "}
              passen.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <View
        className={`px-5 py-4 border-t ${
          isDark
            ? "bg-dark-bg border-dark-border"
            : "bg-white border-gray-100"
        }`}
      >
        <TouchableOpacity
          disabled={!canContinue}
          onPress={next}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
            canContinue ? "bg-primary-500" : "bg-gray-300"
          }`}
        >
          <Text className="text-white font-bold text-[15px]">
            {current === "done"
              ? "Zu meinen Empfehlungen"
              : current === "skills"
                ? t("common.finish")
                : t("common.continue")}
          </Text>
          <ChevronRight size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
