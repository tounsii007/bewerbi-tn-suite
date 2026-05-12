import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui/Card";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../src/lib/supabase";
import { mockProfiles, mockJobs, mockApplications } from "../../src/lib/mockData";

export default function AdminReportsScreen() {
  const { isDark } = useThemeStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    applicants: 0,
    employers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    if (IS_MOCK_MODE) {
      setStats({
        totalUsers: mockProfiles.length,
        applicants: mockProfiles.filter(p => p.role === "applicant").length,
        employers: mockProfiles.filter(p => p.role === "employer").length,
        totalJobs: mockJobs.length,
        activeJobs: mockJobs.filter(j => j.status === "active").length,
        totalApplications: mockApplications.length,
      });
      return;
    }
    const [users, jobs, applications] = await Promise.all([
      supabase.from("profiles").select("role", { count: "exact" }),
      supabase.from("jobs").select("status", { count: "exact" }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
    ]);

    const profiles: { role: string }[] = users.data || [];
    const jobList: { status: string }[] = jobs.data || [];

    setStats({
      totalUsers: profiles.length,
      applicants: profiles.filter((p) => p.role === "applicant").length,
      employers: profiles.filter((p) => p.role === "employer").length,
      totalJobs: jobList.length,
      activeJobs: jobList.filter((j) => j.status === "active").length,
      totalApplications: applications.count || 0,
    });
  };

  const cards = [
    { title: "Gesamte Benutzer", value: stats.totalUsers, icon: Users, color: "#2563EB", subtitle: `${stats.applicants} Bewerber, ${stats.employers} Arbeitgeber` },
    { title: "Stellenanzeigen", value: stats.totalJobs, icon: Briefcase, color: "#16a34a", subtitle: `${stats.activeJobs} aktiv` },
    { title: "Bewerbungen", value: stats.totalApplications, icon: FileText, color: "#f59e0b", subtitle: "Gesamt" },
  ];

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView className="flex-1 px-6">
        <Text className={`text-2xl font-bold pt-4 pb-4 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          Berichte & Statistiken
        </Text>

        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Animated.View key={card.title} entering={FadeInDown.delay(index * 100).springify()}>
              <Card className="mb-4">
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: card.color + "15" }}>
                    <Icon size={28} color={card.color} />
                  </View>
                  <View>
                    <Text className={`text-3xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{card.value}</Text>
                    <Text className={`text-sm font-medium ${isDark ? "text-dark-text" : "text-gray-700"}`}>{card.title}</Text>
                    <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{card.subtitle}</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        })}

        {/* Category Distribution */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Card className="mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <TrendingUp size={20} color="#2563EB" />
              <Text className={`text-base font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                Plattform-Highlights
              </Text>
            </View>
            <View className="gap-3">
              {[
                { label: "Aktivste Kategorie", value: "IT & Software" },
                { label: "Häufigster Bewerberstandort", value: "Tunis, Tunesien" },
                { label: "Meist gesuchtes Niveau", value: "B1 Deutsch" },
              ].map((item) => (
                <View key={item.label} className="flex-row justify-between">
                  <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{item.label}</Text>
                  <Text className={`text-sm font-medium ${isDark ? "text-dark-text" : "text-gray-900"}`}>{item.value}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
