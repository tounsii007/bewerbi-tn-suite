import { useEffect, useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Bell,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Send,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Card } from "../../../src/components/ui/Card";
import { JobCard } from "../../../src/components/shared/JobCard";
import { JobCardSkeleton } from "../../../src/components/shared/JobCardSkeleton";
import { CategoryCard } from "../../../src/components/shared/CategoryCard";
import { useAuthStore } from "../../../src/stores/authStore";
import { useJobStore } from "../../../src/stores/jobStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import type { Profile } from "../../../src/types";

const heroGradientStyle = Platform.select<Record<string, string>>({
  web: {
    background:
      "linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)",
  },
  default: {},
}) as Record<string, string>;

function computeProfileCompleteness(profile: Profile | null): number {
  if (!profile) return 0;
  const fields: Array<keyof Profile> = [
    "first_name",
    "last_name",
    "phone",
    "city",
    "bio",
    "photo_url",
    "country",
  ];
  const weights: Record<string, number> = {
    first_name: 15,
    last_name: 15,
    phone: 15,
    city: 10,
    bio: 15,
    photo_url: 15,
    country: 15,
  };
  return fields.reduce(
    (sum, key) => (profile[key] ? sum + weights[key as string] : sum),
    0,
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    jobs,
    fetchJobs,
    toggleFavorite,
    favorites,
    fetchFavorites,
    myApplications,
    fetchMyApplications,
    loading,
    error,
  } = useJobStore();
  const { isDark } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (profile?.user_id) fetchFavorites(profile.user_id);
    if (profile?.id) fetchMyApplications(profile.id);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, []);

  const categories = [
    { title: t("jobs.it"), icon: "monitor", color: "#2563EB" },
    { title: t("jobs.pflege"), icon: "heart-pulse", color: "#DC2626" },
    { title: t("jobs.transport"), icon: "truck", color: "#f59e0b" },
    { title: t("jobs.ausbildung"), icon: "graduation-cap", color: "#16a34a" },
    { title: t("jobs.sprachkurs"), icon: "book-open", color: "#8b5cf6" },
    { title: t("jobs.sonstige"), icon: "briefcase", color: "#6b7280" },
  ];

  const completeness = computeProfileCompleteness(profile);
  const latestJobs = jobs.slice(0, 5);
  const showSkeletons = loading && jobs.length === 0 && !refreshing;

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        <Animated.View
          entering={FadeInDown.springify()}
          className="bg-primary-500 mx-5 mt-4 rounded-3xl px-6 pt-5 pb-6"
          style={heroGradientStyle}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <Avatar
                uri={profile?.photo_url}
                name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
                size="md"
                onPress={() => router.push("/(applicant)/(profile)")}
              />
              <View>
                <Text className="text-primary-100 text-[13px]">
                  {t("home.greeting", {
                    name: profile?.first_name || "User",
                  })}
                </Text>
                <Text className="text-white text-xl font-bold tracking-wide">
                  bewerbi.tn
                </Text>
              </View>
            </View>
            <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
              <Bell size={20} color="#fff" />
            </View>
          </View>

          <View className="flex-row gap-3">
            <HeroStat
              icon={<Send size={18} color="#fff" />}
              value={myApplications.length}
              label="Bewerbungen"
            />
            <HeroStat
              icon={<Bookmark size={18} color="#fff" />}
              value={favorites.length}
              label="Favoriten"
            />
            <HeroStat
              icon={<TrendingUp size={18} color="#fff" />}
              value={jobs.length}
              label="Offene Stellen"
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-5 mt-6"
        >
          <Card
            onPress={() => router.push("/(applicant)/(profile)")}
            className="flex-row items-center gap-4"
          >
            <View className="flex-1">
              <Text
                className={`text-[15px] font-bold ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                {t("home.profileComplete", { percent: completeness })}
              </Text>
              <Text
                className={`text-[13px] mt-1 leading-5 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                {t("home.profileHint", {
                  defaultValue:
                    "Vervollständige dein Profil für bessere Chancen",
                })}
              </Text>
              <View className="mt-3 flex-row items-center gap-3">
                <View
                  className={`flex-1 h-2 rounded-full overflow-hidden ${
                    isDark ? "bg-dark-border" : "bg-gray-200"
                  }`}
                >
                  <View
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${completeness}%` }}
                  />
                </View>
                <Text
                  className={`text-[13px] font-semibold ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  {completeness}%
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={isDark ? "#64748b" : "#9ca3af"} />
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mt-8"
        >
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("home.categories")}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.icon}
                title={cat.title}
                icon={cat.icon}
                color={cat.color}
                onPress={() => router.push("/(applicant)/(search)")}
                index={i}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="mt-8 px-5 pb-8"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {t("home.latest")}
            </Text>
            <Text
              className="text-primary-500 text-[15px] font-semibold"
              onPress={() => router.push("/(applicant)/(search)")}
            >
              {t("common.seeAll")} →
            </Text>
          </View>

          {showSkeletons ? (
            <>
              {[0, 1, 2].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </>
          ) : error ? (
            <Card>
              <Text
                className={`text-center py-4 font-semibold ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                {t("common.error", { defaultValue: "Fehler" })}
              </Text>
              <Text
                className={`text-center pb-2 text-sm ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                {error}
              </Text>
            </Card>
          ) : latestJobs.length === 0 ? (
            <Card>
              <Text
                className={`text-center py-8 ${
                  isDark ? "text-dark-muted" : "text-gray-400"
                }`}
              >
                {t("common.noResults")}
              </Text>
            </Card>
          ) : (
            latestJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onPress={() => router.push(`/(applicant)/(home)/${job.id}`)}
                onFavorite={() =>
                  profile?.user_id && toggleFavorite(profile.user_id, job.id)
                }
                isFavorite={favorites.includes(job.id)}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <View className="flex-1 bg-white/15 rounded-2xl px-4 py-3 items-center">
      {icon}
      <Text className="text-white text-2xl font-bold mt-1">{value}</Text>
      <Text className="text-primary-100 text-[11px]">{label}</Text>
    </View>
  );
}
