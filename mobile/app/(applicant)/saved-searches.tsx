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
import { useSavedSearchStore, type SavedSearch } from "../../src/stores/savedSearchStore";
import { useJobStore } from "../../src/stores/jobStore";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { EmptyState } from "../../src/components/shared/EmptyState";
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
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="px-5 pt-4 pb-2">
        <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("savedSearches.title")}
        </Text>
        <Text className={`text-[13px] mt-0.5 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
          {searches.length} aktiv
        </Text>
      </View>
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
          <EmptyState
            icon={<Bookmark size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title={t("savedSearches.empty")}
          />
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
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <View
        className={`rounded-2xl p-4 mb-3 border ${
          isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
        }`}
      >
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
      </View>
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
