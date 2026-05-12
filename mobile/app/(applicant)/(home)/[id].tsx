import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { MapPin, Clock, Briefcase, GraduationCap, ArrowLeft, Heart, Share2 } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Input } from "../../../src/components/ui/Input";
import { Card } from "../../../src/components/ui/Card";
import { useJobStore } from "../../../src/stores/jobStore";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { jobTypeBadgeVariant } from "../../../src/lib/jobPresentation";
import type { Job } from "../../../src/types";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { fetchJobById, applyToJob, toggleFavorite, favorites } = useJobStore();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadError(false);
    fetchJobById(id).then((result) => {
      if (result) {
        setJob(result);
      } else {
        setLoadError(true);
      }
    });
  }, [id]);

  const handleApply = async () => {
    if (!profile?.id || !id) return;
    setApplying(true);
    try {
      await applyToJob(id, profile.id, coverLetter);
      Alert.alert(t("common.success"), t("jobs.applicationSent"));
      setShowApply(false);
      setCoverLetter("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("common.error");
      Alert.alert(t("common.error"), msg);
    } finally {
      setApplying(false);
    }
  };

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <Text className={`text-center font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("common.noResults")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary-500 font-semibold">← {t("common.back", { defaultValue: "Zurück" })}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className={isDark ? "text-dark-muted" : "text-gray-400"}>{t("common.loading")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      {/* Top Bar */}
      <Animated.View entering={FadeInDown} className="flex-row items-center justify-between px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <ArrowLeft size={20} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => profile?.user_id && toggleFavorite(profile.user_id, job.id)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Heart
              size={20}
              color={favorites.includes(job.id) ? "#DC2626" : "#6b7280"}
              fill={favorites.includes(job.id) ? "#DC2626" : "none"}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
          <View className="flex-row gap-2 mb-2">
            <Badge label={t(`jobs.${job.type}`)} variant={jobTypeBadgeVariant[job.type]} size="md" />
            <Badge label={t(`jobs.${job.category}`)} size="md" />
          </View>
          <Text className={`text-2xl font-bold mt-2 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {job.title}
          </Text>

          <View className="flex-row items-center gap-4 mt-3">
            <View className="flex-row items-center gap-1">
              <MapPin size={16} color={isDark ? "#94a3b8" : "#6b7280"} />
              <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{job.location}</Text>
            </View>
            {job.salary_range && (
              <View className="flex-row items-center gap-1">
                <Briefcase size={16} color={isDark ? "#94a3b8" : "#6b7280"} />
                <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{job.salary_range}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Employer */}
        {job.employer && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card className="flex-row items-center gap-3 mb-4">
              <Avatar
                uri={job.employer.photo_url}
                name={`${job.employer.first_name} ${job.employer.last_name}`}
                size="sm"
              />
              <View>
                <Text className={`font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                  {job.employer.first_name} {job.employer.last_name}
                </Text>
                <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                  {t("jobs.postedBy")}
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* German Level */}
        {job.german_level && (
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Card className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                <GraduationCap size={20} color="#2563EB" />
              </View>
              <View>
                <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{t("jobs.germanLevel")}</Text>
                <Text className={`font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{job.german_level}</Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-4">
          <Text className={`text-base font-semibold mb-2 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {t("jobs.details")}
          </Text>
          <Text className={`text-sm leading-6 ${isDark ? "text-dark-muted" : "text-gray-600"}`}>
            {job.description}
          </Text>
        </Animated.View>

        {/* Requirements */}
        {job.requirements && (
          <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-6">
            <Text className={`text-base font-semibold mb-2 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
              {t("jobs.requirements")}
            </Text>
            <Text className={`text-sm leading-6 ${isDark ? "text-dark-muted" : "text-gray-600"}`}>
              {job.requirements}
            </Text>
          </Animated.View>
        )}

        {/* Apply Section */}
        {showApply && (
          <Animated.View entering={FadeInDown.springify()} className="mb-6">
            <Card>
              <Text className={`text-base font-semibold mb-3 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                {t("jobs.coverLetter")}
              </Text>
              <Input
                label=""
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="Schreibe dein Anschreiben..."
                multiline
                numberOfLines={6}
              />
              <View className="flex-row gap-3 mt-2">
                <Button
                  title={t("common.cancel")}
                  onPress={() => setShowApply(false)}
                  variant="outline"
                  className="flex-1"
                />
                <Button
                  title={t("common.submit")}
                  onPress={handleApply}
                  loading={applying}
                  className="flex-1"
                />
              </View>
            </Card>
          </Animated.View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Bottom CTA */}
      {!showApply && (
        <Animated.View
          entering={FadeInUp.springify()}
          className={`absolute bottom-0 left-0 right-0 px-6 py-4 ${isDark ? "bg-dark-bg" : "bg-white"} border-t ${isDark ? "border-dark-border" : "border-gray-100"}`}
        >
          <SafeAreaView edges={["bottom"]}>
            <Button
              title={t("jobs.applyNow")}
              onPress={() => setShowApply(true)}
              size="lg"
              className="w-full"
            />
          </SafeAreaView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
