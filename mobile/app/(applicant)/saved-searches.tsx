import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BellOff,
  Bookmark,
  Trash2,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSavedSearchStore, type SavedSearch } from "../../src/stores/savedSearchStore";
import { useJobStore } from "../../src/stores/jobStore";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { GradientText } from "../../src/components/ui/GradientText";
import { NumberTicker } from "../../src/components/ui/NumberTicker";
import {
  ALERT_FREQUENCY_LABELS,
  type AlertFrequency,
  matchJobs,
  smartName,
} from "../../src/lib/savedSearchHelpers";

const FREQ_OPTIONS: AlertFrequency[] = ["INSTANT", "DAILY", "WEEKLY", "OFF"];

export default function SavedSearchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { searches, load, remove, markViewed, setAlertFrequency } = useSavedSearchStore();
  const { jobs, setFilters } = useJobStore();
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const runSearch = async (s: SavedSearch) => {
    await markViewed(s.id);
    setFilters({
      search: s.query,
      category: s.category,
      type: s.type,
      location: s.location,
    });
    router.push("/(applicant)/(search)");
  };

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Animated.View entering={FadeInDown.springify()} className="px-5 pt-4 pb-3">
          <View className="flex-row items-start gap-3">
            <LinearGradient
              colors={["#2563EB", "#06b6d4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Bookmark size={22} color="white" />
            </LinearGradient>
            <View className="flex-1">
              <GradientText
                variant="brand"
                style={{ fontSize: 22, fontWeight: "800", lineHeight: 26 }}
              >
                {t("savedSearches.title")}
              </GradientText>
              <View className="flex-row items-baseline gap-1.5 mt-1">
                <NumberTicker
                  value={searches.length}
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#2563EB",
                  }}
                />
                <Text
                  className={`text-[13px] ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  {searches.length === 1 ? "aktiv" : "aktive Suchen"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
        <FlatList
          data={searches}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <SavedSearchRow
              item={item}
              index={index}
              jobs={jobs}
              onRun={() => runSearch(item)}
              onDelete={() => remove(item.id)}
              onOpenPicker={() => setPickerFor(item.id)}
              isDark={isDark}
            />
          )}
          ListEmptyComponent={
            <View className="px-2 pt-8">
              <GlassCard strength="default" style={{ padding: 32, alignItems: "center" }}>
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(37, 99, 235, 0.15)" }}
                >
                  <Bookmark size={32} color="#2563EB" />
                </View>
                <Text
                  className={`text-[18px] font-extrabold text-center ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  {t("savedSearches.empty")}
                </Text>
                <Text
                  className={`text-[13px] text-center mt-2 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Speichere deine Filter mit dem Bookmark-Icon in der Suche — sie landen hier mit Alerts.
                </Text>
              </GlassCard>
            </View>
          }
        />

        <FrequencyPicker
          visible={pickerFor !== null}
          current={searches.find((s) => s.id === pickerFor)?.alertFrequency ?? "DAILY"}
          onPick={async (freq) => {
            if (pickerFor) await setAlertFrequency(pickerFor, freq);
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
          isDark={isDark}
        />
      </SafeAreaView>
    </AuroraBackground>
  );
}

function SavedSearchRow({
  item,
  index,
  jobs,
  onRun,
  onDelete,
  onOpenPicker,
  isDark,
}: {
  item: SavedSearch;
  index: number;
  jobs: Parameters<typeof matchJobs>[0];
  onRun: () => void;
  onDelete: () => void;
  onOpenPicker: () => void;
  isDark: boolean;
}) {
  const match = useMemo(
    () =>
      matchJobs(jobs, {
        query: item.query,
        category: item.category,
        type: item.type,
        location: item.location,
        minGermanLevel: item.minGermanLevel,
        salaryMin: item.salaryMin,
      }, item.lastViewedAt),
    [item, jobs],
  );

  const freqLabel = ALERT_FREQUENCY_LABELS[item.alertFrequency];
  const off = item.alertFrequency === "OFF";

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={{ marginBottom: 12 }}>
      <GlassCard strength="default" style={{ padding: 16 }}>
        <TouchableOpacity onPress={onRun} className="flex-row items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                className={`text-[15px] font-bold flex-1 ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                {item.name}
              </Text>
              {match.fresh > 0 && (
                <Animated.View entering={FadeInUp} className="flex-row items-center gap-1 bg-primary-500 rounded-full px-2 py-0.5">
                  <Sparkles size={10} color="#fff" />
                  <Text className="text-white text-[10px] font-bold">
                    {match.fresh} neu
                  </Text>
                </Animated.View>
              )}
            </View>
            <Text className={`text-[12px] mt-1 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
              {smartName({
                query: item.query,
                category: item.category,
                type: item.type,
                location: item.location,
                minGermanLevel: item.minGermanLevel,
                salaryMin: item.salaryMin,
              })}
            </Text>
            <Text className={`text-[11px] mt-1 ${isDark ? "text-dark-subtle" : "text-gray-400"}`}>
              {match.total} {match.total === 1 ? "Treffer" : "Treffer"}
            </Text>
          </View>
          <ChevronRight size={18} color={isDark ? "#64748b" : "#9ca3af"} />
        </TouchableOpacity>

        <View
          className={`flex-row items-center gap-2 mt-3 pt-3 border-t ${
            isDark ? "border-dark-border" : "border-gray-100"
          }`}
        >
          <TouchableOpacity
            onPress={onOpenPicker}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              off
                ? isDark
                  ? "border-dark-border"
                  : "border-gray-200"
                : "border-primary-500 bg-primary-50"
            }`}
          >
            {off ? (
              <BellOff size={12} color={isDark ? "#64748b" : "#9ca3af"} />
            ) : (
              <Bell size={12} color="#2563EB" />
            )}
            <Text
              className={`text-[11px] font-semibold ${
                off
                  ? isDark
                    ? "text-dark-muted"
                    : "text-gray-500"
                  : "text-primary-700"
              }`}
            >
              {freqLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="flex-row items-center gap-1.5 ml-auto"
          >
            <Trash2 size={14} color="#DC2626" />
            <Text className="text-[12px] font-semibold text-accent-500">Löschen</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function FrequencyPicker({
  visible,
  current,
  onPick,
  onClose,
  isDark,
}: {
  visible: boolean;
  current: AlertFrequency;
  onPick: (f: AlertFrequency) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end bg-black/50"
      >
        <Animated.View
          entering={FadeInUp.springify()}
          className={`w-full rounded-t-3xl p-5 ${isDark ? "bg-dark-card" : "bg-white"}`}
        >
          <Text
            className={`text-[13px] font-bold uppercase tracking-wider mb-3 ${
              isDark ? "text-dark-muted" : "text-gray-400"
            }`}
          >
            Benachrichtigungs-Frequenz
          </Text>
          {FREQ_OPTIONS.map((opt) => {
            const active = opt === current;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => onPick(opt)}
                className={`flex-row items-center px-4 py-4 rounded-2xl mb-1 ${
                  active
                    ? "bg-primary-50"
                    : isDark
                      ? "bg-dark-bg"
                      : "bg-gray-50"
                }`}
              >
                <Text
                  className={`flex-1 text-[15px] font-semibold ${
                    active
                      ? "text-primary-700"
                      : isDark
                        ? "text-dark-text"
                        : "text-gray-900"
                  }`}
                >
                  {ALERT_FREQUENCY_LABELS[opt]}
                </Text>
                {active && <Check size={18} color="#2563EB" />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
