import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  GraduationCap, Briefcase, Languages, FileText,
  ChevronRight, Camera, MapPin, Phone,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../../src/components/ui/GlassCard";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockEducation, mockExperience, mockLanguages, mockDocuments } from "../../../src/lib/mockData";
import type { Education, Experience, LanguageSkill, Document } from "../../../src/types";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [languages, setLanguages] = useState<LanguageSkill[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (profile?.id) loadProfileData();
  }, [profile?.id]);

  const loadProfileData = async () => {
    if (!profile?.id) return;
    if (IS_MOCK_MODE) {
      setEducation(mockEducation.filter((e) => e.profile_id === profile.id));
      setExperience(mockExperience.filter((e) => e.profile_id === profile.id));
      setLanguages(mockLanguages.filter((l) => l.profile_id === profile.id));
      setDocuments(mockDocuments.filter((d) => d.profile_id === profile.id));
      return;
    }
    const [edu, exp, lang, docs] = await Promise.all([
      supabase.from("education").select("*").eq("profile_id", profile.id).order("start_date", { ascending: false }),
      supabase.from("experience").select("*").eq("profile_id", profile.id).order("start_date", { ascending: false }),
      supabase.from("language_skills").select("*").eq("profile_id", profile.id),
      supabase.from("documents").select("*").eq("profile_id", profile.id),
    ]);
    setEducation(edu.data || []);
    setExperience(exp.data || []);
    setLanguages(lang.data || []);
    setDocuments(docs.data || []);
  };

  const sections = [
    { title: t("profile.education"), icon: GraduationCap, count: education.length, route: "/(applicant)/(profile)/education", color: "#3b82f6", bg: "bg-blue-50", borderColor: "border-l-blue-400" },
    { title: t("profile.experience"), icon: Briefcase, count: experience.length, route: "/(applicant)/(profile)/experience", color: "#10b981", bg: "bg-emerald-50", borderColor: "border-l-emerald-400" },
    { title: t("profile.languages"), icon: Languages, count: languages.length, route: "/(applicant)/(profile)/languages", color: "#8b5cf6", bg: "bg-violet-50", borderColor: "border-l-violet-400" },
    { title: t("profile.documents"), icon: FileText, count: documents.length, route: "/(applicant)/(profile)/documents", color: "#f59e0b", bg: "bg-amber-50", borderColor: "border-l-amber-400" },
  ];

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile hero on aurora */}
        <Animated.View
          entering={FadeInDown.springify()}
          className="mx-5 mt-4"
        >
          <AuroraBackground variant="vivid" style={{ borderRadius: 24 }}>
            <View className="items-center px-6 pt-7 pb-8">
              <View className="relative mb-4">
                <View
                  style={{
                    padding: 3,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Avatar
                    uri={profile?.photo_url}
                    name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
                    size="xl"
                    border={false}
                  />
                </View>
                <TouchableOpacity
                  className="absolute bottom-0 right-0"
                  onPress={() => router.push("/(applicant)/(profile)/edit")}
                  accessibilityLabel="Foto ändern"
                >
                  <LinearGradient
                    colors={["#2563EB", "#6d4cf7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "white",
                    }}
                  >
                    <Camera size={14} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text
                className={`text-xl font-extrabold text-center ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                {profile?.first_name} {profile?.last_name}
              </Text>

              {profile?.city && (
                <View className="flex-row items-center gap-1.5 mt-2">
                  <MapPin size={13} color={isDark ? "#94a3b8" : "#475569"} />
                  <Text
                    className={`text-[13px] font-medium ${
                      isDark ? "text-dark-muted" : "text-gray-600"
                    }`}
                  >
                    {profile.city}
                    {profile.country ? `, ${profile.country}` : ""}
                  </Text>
                </View>
              )}

              {profile?.phone && (
                <View className="flex-row items-center gap-1.5 mt-1">
                  <Phone size={12} color={isDark ? "#94a3b8" : "#475569"} />
                  <Text
                    className={`text-[13px] ${
                      isDark ? "text-dark-muted" : "text-gray-600"
                    }`}
                  >
                    {profile.phone}
                  </Text>
                </View>
              )}

              {profile?.bio && (
                <GlassCard strength="strong" style={{ padding: 14, marginTop: 16 }}>
                  <Text
                    className={`text-[13px] text-center leading-5 ${
                      isDark ? "text-dark-text" : "text-gray-700"
                    }`}
                  >
                    {profile.bio}
                  </Text>
                </GlassCard>
              )}
            </View>
          </AuroraBackground>
        </Animated.View>

        {/* Sections */}
        <View className="px-5 mt-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Animated.View key={section.title} entering={FadeInDown.delay((index + 1) * 80).springify()}>
                <TouchableOpacity
                  onPress={() => router.push(section.route as any)}
                  activeOpacity={0.7}
                >
                  <Card className={`flex-row items-center justify-between mb-2 border-l-4 ${section.borderColor}`} elevation={1}>
                    <View className="flex-row items-center gap-4">
                      <View className={`w-11 h-11 rounded-full ${section.bg} items-center justify-center`}>
                        <Icon size={20} color={section.color} />
                      </View>
                      <View>
                        <Text className={`font-semibold text-[15px] ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                          {section.title}
                        </Text>
                        <Text className={`text-[13px] mt-0.5 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                          {section.count} {section.count === 1 ? "Eintrag" : "Einträge"}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={isDark ? "#475569" : "#cbd5e1"} />
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Languages Preview */}
        {languages.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).springify()} className="px-5 pb-8 mt-4">
            <Text className={`text-lg font-bold mb-4 px-1 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
              {t("profile.languages")}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge key={lang.id} label={`${lang.language} (${lang.level})`} variant="info" size="md" />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
