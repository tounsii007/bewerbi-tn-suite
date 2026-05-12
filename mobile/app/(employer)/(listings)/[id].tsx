import { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin, Clock, CheckCircle, XCircle, Eye } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Button } from "../../../src/components/ui/Button";
import { useJobStore } from "../../../src/stores/jobStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockApplications } from "../../../src/lib/mockData";
import type { Job, Application } from "../../../src/types";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { fetchJobById } = useJobStore();
  const { isDark } = useThemeStore();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (id) {
      fetchJobById(id).then(setJob);
      loadApplications();
    }
  }, [id]);

  const loadApplications = async () => {
    if (!id) return;
    if (IS_MOCK_MODE) {
      setApplications(mockApplications.filter(a => a.job_id === id));
      return;
    }
    const { data } = await supabase
      .from("applications")
      .select("*, applicant:profiles(*)")
      .eq("job_id", id)
      .order("created_at", { ascending: false });
    setApplications(data || []);
  };

  const updateApplicationStatus = async (appId: string, status: string) => {
    if (IS_MOCK_MODE) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: status as Application["status"] } : a));
      return;
    }
    await supabase.from("applications").update({ status }).eq("id", appId);
    loadApplications();
  };

  if (!job) return null;

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 ${isDark ? "text-dark-text" : "text-gray-900"}`} numberOfLines={1}>
          {job.title}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Job Summary */}
        <Animated.View entering={FadeInDown.springify()}>
          <Card className="mb-4">
            <View className="flex-row gap-2 mb-2">
              <Badge label={t(`jobs.${job.type}`)} variant="info" />
              <Badge label={t(`jobs.${job.category}`)} />
              <Badge label={job.status === "active" ? "Aktiv" : "Geschlossen"} variant={job.status === "active" ? "success" : "default"} />
            </View>
            <View className="flex-row items-center gap-2 mt-2">
              <MapPin size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
              <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{job.location}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Applications */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text className={`text-lg font-bold mb-3 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {t("employer.applicants")} ({applications.length})
          </Text>

          {applications.map((app, index) => (
            <Card key={app.id} className="mb-3" index={index}>
              <View className="flex-row items-start gap-3">
                <Avatar
                  uri={app.applicant?.photo_url}
                  name={`${app.applicant?.first_name || ""} ${app.applicant?.last_name || ""}`}
                  size="sm"
                />
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                    {app.applicant?.first_name} {app.applicant?.last_name}
                  </Text>
                  <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                    {app.applicant?.city}, {app.applicant?.country}
                  </Text>
                  <Text className={`text-xs mt-1 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                    {new Date(app.created_at).toLocaleDateString("de-DE")}
                  </Text>
                  {app.cover_letter && (
                    <Text className={`text-sm mt-2 ${isDark ? "text-dark-muted" : "text-gray-600"}`} numberOfLines={3}>
                      {app.cover_letter}
                    </Text>
                  )}
                </View>
                <Badge label={t(`applications.${app.status}`)} variant={
                  app.status === "accepted" ? "success" : app.status === "rejected" ? "error" : app.status === "reviewed" ? "info" : "warning"
                } />
              </View>

              {app.status === "pending" && (
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button title={t("applications.reviewed")} onPress={() => updateApplicationStatus(app.id, "reviewed")} variant="outline" size="sm" className="flex-1" icon={<Eye size={14} color="#2563EB" />} />
                  <Button title={t("applications.accepted")} onPress={() => updateApplicationStatus(app.id, "accepted")} variant="primary" size="sm" className="flex-1" icon={<CheckCircle size={14} color="#fff" />} />
                  <Button title="" onPress={() => updateApplicationStatus(app.id, "rejected")} variant="ghost" size="sm" icon={<XCircle size={18} color="#DC2626" />} />
                </View>
              )}
            </Card>
          ))}

          {applications.length === 0 && (
            <Card>
              <Text className={`text-center py-4 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                Noch keine Bewerbungen
              </Text>
            </Card>
          )}
        </Animated.View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
