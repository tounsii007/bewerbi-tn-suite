import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, X, BookmarkPlus, RotateCcw, Inbox } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { JobCard } from "../../../src/components/shared/JobCard";
import { JobCardSkeleton } from "../../../src/components/shared/JobCardSkeleton";
import { SalaryRangePicker } from "../../../src/components/ui/SalaryRangePicker";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../../src/components/ui/GlassCard";
import { useJobStore } from "../../../src/stores/jobStore";
import { useAuthStore } from "../../../src/stores/authStore";
import { useSavedSearchStore } from "../../../src/stores/savedSearchStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { useDebouncedValue } from "../../../src/hooks/useDebouncedValue";
import { smartName } from "../../../src/lib/savedSearchHelpers";
import { useToast } from "../../../src/components/ui/Toast";
import type { JobCategory, JobType } from "../../../src/types";

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    jobs,
    fetchJobs,
    filters,
    setFilters,
    toggleFavorite,
    favorites,
    loading,
  } = useJobStore();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const { create: createSavedSearch } = useSavedSearchStore();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [salaryMin, setSalaryMin] = useState<number | undefined>();
  const [salaryMax, setSalaryMax] = useState<number | undefined>();
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const handleSaveSearch = async () => {
    const name = smartName({
      query: filters.search,
      category: filters.category,
      type: filters.type,
      location: filters.location,
      salaryMin,
    });
    await createSavedSearch({
      name,
      query: filters.search,
      category: filters.category,
      type: filters.type,
      location: filters.location,
      salaryMin,
      alertsEnabled: true,
      alertFrequency: "DAILY",
    });
    toast.success(`"${name}" gespeichert`, {
      label: "Ansehen",
      onPress: () => router.push("/(applicant)/saved-searches"),
    });
  };

  useEffect(() => {
    const next = debouncedQuery.trim() || undefined;
    if (next !== filters.search) {
      setFilters({ ...filters, search: next });
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const hasActiveFilters = !!(filters.category || filters.type || filters.search);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const categories: { key: JobCategory; label: string }[] = [
    { key: "it", label: t("jobs.it") },
    { key: "pflege", label: t("jobs.pflege") },
    { key: "transport", label: t("jobs.transport") },
    { key: "sonstige", label: t("jobs.sonstige") },
  ];

  const types: { key: JobType; label: string }[] = [
    { key: "job", label: t("jobs.job") },
    { key: "ausbildung", label: t("jobs.ausbildung") },
    { key: "studium", label: t("jobs.studium") },
    { key: "sprachkurs", label: t("jobs.sprachkurs") },
  ];

  const showSkeletons = loading && jobs.length === 0;

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Animated.View entering={FadeInDown} className="px-5 pt-4 pb-2">
          {/* Glass-card search bar */}
          <GlassCard strength="strong" style={{ padding: 0 }}>
            <View className="flex-row items-center px-4">
              <Search size={20} color={isDark ? "#64748b" : "#94a3b8"} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("jobs.search")}
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                className={`flex-1 ${
                  Platform.OS === "web" ? "py-0" : "py-3.5"
                } px-3 text-[15px] ${isDark ? "text-dark-text" : "text-gray-900"}`}
                style={Platform.OS === "web" ? { height: 48 } : undefined}
                returnKeyType="search"
              />
              {loading && debouncedQuery ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#64748b" : "#94a3b8"}
                />
              ) : searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  accessibilityLabel="Suche löschen"
                >
                  <X size={18} color={isDark ? "#64748b" : "#94a3b8"} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className={`ml-2 w-9 h-9 rounded-xl items-center justify-center ${
                  showFilters ? "bg-primary-500/15" : ""
                }`}
                accessibilityLabel="Filter"
              >
                <SlidersHorizontal
                  size={18}
                  color={showFilters ? "#2563EB" : isDark ? "#64748b" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>

          <View className="flex-row items-center justify-between mt-3 mb-1 px-1">
            <Text
              className={`text-[13px] font-medium ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {jobs.length} {jobs.length === 1 ? "Ergebnis" : "Ergebnisse"}
            </Text>
            <View className="flex-row items-center gap-3">
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={handleSaveSearch}
                  className="flex-row items-center gap-1"
                >
                  <BookmarkPlus size={14} color="#2563EB" />
                  <Text className="text-[13px] font-bold text-primary-500">
                    {t("savedSearches.save")}
                  </Text>
                </TouchableOpacity>
              )}
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={clearAllFilters}
                  className="flex-row items-center gap-1"
                >
                  <RotateCcw size={12} color="#2563EB" />
                  <Text className="text-[13px] font-bold text-primary-500">
                    {t("common.clearAll")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {showFilters && (
          <Animated.View entering={FadeInDown.springify()} className="px-5 py-3">
            <Text
              className={`text-[11px] font-bold mb-2 uppercase ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
              style={{ letterSpacing: 0.8 }}
            >
              {t("jobs.category")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const active = filters.category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        category: active ? undefined : cat.key,
                      })
                    }
                    className="rounded-full"
                    style={
                      active
                        ? {
                            backgroundColor: "#2563EB",
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                            shadowColor: "#2563EB",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : {
                            backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                          }
                    }
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        active
                          ? "text-white"
                          : isDark
                            ? "text-dark-text"
                            : "text-gray-700"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              className={`text-[11px] font-bold mb-2 uppercase ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
              style={{ letterSpacing: 0.8 }}
            >
              {t("jobs.type")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {types.map((type) => {
                const active = filters.type === type.key;
                return (
                  <TouchableOpacity
                    key={type.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        type: active ? undefined : type.key,
                      })
                    }
                    className="rounded-full"
                    style={
                      active
                        ? {
                            backgroundColor: "#2563EB",
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                            shadowColor: "#2563EB",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : {
                            backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                          }
                    }
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        active
                          ? "text-white"
                          : isDark
                            ? "text-dark-text"
                            : "text-gray-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SalaryRangePicker
              min={salaryMin}
              max={salaryMax}
              onChange={({ min, max }) => {
                setSalaryMin(min);
                setSalaryMax(max);
              }}
              category={filters.category}
              jobs={jobs}
            />
          </Animated.View>
        )}

      {showSkeletons ? (
        <View className="px-5 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          renderItem={({ item, index }) => (
            <JobCard
              job={item}
              index={index}
              onPress={() => router.push(`/(applicant)/(home)/${item.id}`)}
              onFavorite={() =>
                profile?.user_id && toggleFavorite(profile.user_id, item.id)
              }
              isFavorite={favorites.includes(item.id)}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="px-2 pt-8">
                <GlassCard strength="default" style={{ padding: 32, alignItems: "center" }}>
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(37, 99, 235, 0.15)" }}
                  >
                    <Inbox size={32} color="#2563EB" />
                  </View>
                  <Text
                    className={`text-[18px] font-extrabold text-center ${
                      isDark ? "text-dark-text" : "text-gray-900"
                    }`}
                  >
                    {t("common.noResults")}
                  </Text>
                  <Text
                    className={`text-[13px] text-center mt-2 leading-5 ${
                      isDark ? "text-dark-muted" : "text-gray-600"
                    }`}
                  >
                    {t("jobs.tryDifferentSearch", {
                      defaultValue:
                        "Versuche andere Suchbegriffe oder lockere einen Filter.",
                    })}
                  </Text>
                  {hasActiveFilters && (
                    <TouchableOpacity
                      onPress={clearAllFilters}
                      className="mt-5 flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500/15"
                    >
                      <RotateCcw size={14} color="#2563EB" />
                      <Text className="text-primary-500 text-[13px] font-bold">
                        Filter zurücksetzen
                      </Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              </View>
            ) : null
          }
        />
      )}
      </SafeAreaView>
    </AuroraBackground>
  );
}
