import { useEffect } from "react";
import { View, Text, FlatList, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { useJobStore } from "../../../src/stores/jobStore";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import type { ApplicationStatus } from "../../../src/types";

const statusConfig: Record<ApplicationStatus, {
  variant: "warning" | "info" | "success" | "error";
  icon: typeof Clock;
  label: string;
  color: string;
  borderClass: string;
  bgClass: string;
}> = {
  pending: { variant: "warning", icon: Clock, label: "Ausstehend", color: "#f59e0b", borderClass: "border-l-amber-400", bgClass: "bg-amber-50" },
  reviewed: { variant: "info", icon: Eye, label: "In Prüfung", color: "#2563EB", borderClass: "border-l-blue-400", bgClass: "bg-blue-50" },
  accepted: { variant: "success", icon: CheckCircle, label: "Angenommen", color: "#16a34a", borderClass: "border-l-emerald-400", bgClass: "bg-emerald-50" },
  rejected: { variant: "error", icon: XCircle, label: "Abgelehnt", color: "#DC2626", borderClass: "border-l-red-400", bgClass: "bg-red-50" },
};

export default function ApplicationsScreen() {
  const { t } = useTranslation();
  const { myApplications, fetchMyApplications } = useJobStore();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (profile?.id) fetchMyApplications(profile.id);
  }, [profile?.id]);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="px-5 pt-6 pb-4">
        <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("applications.title")}
        </Text>
        <Text className={`text-[13px] mt-1 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
          {myApplications.length} Bewerbung{myApplications.length !== 1 ? "en" : ""} gesendet
        </Text>
      </View>

      <FlatList
        data={myApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const status = statusConfig[item.status];
          const StatusIcon = status.icon;

          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
              <Card className={`mb-3 border-l-4 ${status.borderClass}`} elevation={1}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start gap-4 flex-1">
                    {/* Status icon in colored circle */}
                    <View
                      className={`w-11 h-11 rounded-full items-center justify-center mt-0.5 ${status.bgClass}`}
                    >
                      <StatusIcon size={20} color={status.color} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[16px] font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                        {item.job?.title || "Stelle"}
                      </Text>
                      {item.job?.employer && (
                        <Text className={`text-[13px] mt-0.5 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                          {item.job.employer.first_name} {item.job.employer.last_name}
                        </Text>
                      )}
                      <Text className={`text-[13px] mt-2 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                        Beworben am {new Date(item.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
                      </Text>
                    </View>
                  </View>
                  {/* Status badge right-aligned */}
                  <View className="items-end ml-2">
                    <Badge label={status.label} variant={status.variant} />
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={<FileText size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title={t("applications.noApplications")}
            subtitle="Bewirb dich auf Stellen, um hier deine Bewerbungen zu sehen"
          />
        }
      />
    </SafeAreaView>
  );
}
