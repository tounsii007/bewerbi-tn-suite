import { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Briefcase, Users, FileText, TrendingUp, LogOut } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/ui/Card";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Button } from "../../../src/components/ui/Button";
import { useAuthStore } from "../../../src/stores/authStore";
import { useJobStore } from "../../../src/stores/jobStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockApplications } from "../../../src/lib/mockData";

export default function EmployerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, signOut } = useAuthStore();
  const { myListings, fetchMyListings } = useJobStore();
  const { isDark } = useThemeStore();
  const [applicationCount, setApplicationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchMyListings(profile.id);
      loadStats();
    }
  }, [profile?.id]);

  const loadStats = async () => {
    if (!profile?.id) return;
    if (IS_MOCK_MODE) {
      setApplicationCount(mockApplications.length);
      return;
    }
    const jobIds = myListings.map((j) => j.id);
    if (jobIds.length > 0) {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("job_id", jobIds);
      setApplicationCount(count || 0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (profile?.id) await fetchMyListings(profile.id);
    await loadStats();
    setRefreshing(false);
  };

  const stats = [
    { title: t("employer.activeListings"), value: myListings.filter((j) => j.status === "active").length, icon: Briefcase, color: "#2563EB" },
    { title: t("employer.newApplications"), value: applicationCount, icon: Users, color: "#16a34a" },
  ];

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown} className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <View className="flex-row items-center gap-3">
            <Avatar uri={profile?.photo_url} name={`${profile?.first_name || ""} ${profile?.last_name || ""}`} size="md" />
            <View>
              <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                {t("home.greeting", { name: profile?.first_name || "User" })}
              </Text>
              <Text className={`text-lg font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                {t("employer.dashboard")}
              </Text>
            </View>
          </View>
          <Button
            title=""
            onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
            variant="ghost"
            size="sm"
            icon={<LogOut size={20} color="#DC2626" />}
          />
        </Animated.View>

        {/* Stats */}
        <View className="flex-row gap-3 px-6 mt-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Animated.View key={stat.title} entering={FadeInDown.delay(index * 100).springify()} className="flex-1">
                <Card>
                  <View className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: stat.color + "15" }}>
                    <Icon size={20} color={stat.color} />
                  </View>
                  <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{stat.value}</Text>
                  <Text className={`text-xs mt-1 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{stat.title}</Text>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mt-6">
          <Button
            title={t("employer.createListing")}
            onPress={() => router.push("/(employer)/(listings)/create")}
            size="lg"
            className="w-full"
          />
        </Animated.View>

        {/* Recent Listings */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="px-6 mt-6 pb-6">
          <Text className={`text-lg font-bold mb-3 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {t("employer.myListings")}
          </Text>
          {myListings.slice(0, 5).map((job, index) => (
            <Card key={job.id} className="mb-3" index={index} onPress={() => router.push(`/(employer)/(listings)/${job.id}`)}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{job.title}</Text>
                  <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                    {job.location} | {t(`jobs.${job.type}`)}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${job.status === "active" ? "bg-green-100" : "bg-gray-100"}`}>
                  <Text className={`text-xs font-medium ${job.status === "active" ? "text-green-800" : "text-gray-600"}`}>
                    {job.status === "active" ? "Aktiv" : "Geschlossen"}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
