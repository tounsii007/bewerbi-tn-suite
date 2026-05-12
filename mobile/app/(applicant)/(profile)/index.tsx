import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Edit3, GraduationCap, Briefcase, Languages, FileText,
  ChevronRight, Camera, MapPin, Phone, Mail
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Button } from "../../../src/components/ui/Button";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockEducation, mockExperience, mockLanguages, mockDocuments } from "../../../src/lib/mockData";
import type { Education, Experience, LanguageSkill, Document } from "../../../src/types";

const headerGradient = Platform.select({
  web: { background: "linear-gradient(135deg, #2563EB 0%, #1e40af 100%)" },
  default: {},
});

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
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.springify()}
          className="bg-primary-500 mx-5 mt-4 rounded-3xl px-6 pt-6 pb-7 items-center"
          style={headerGradient as any}
        >
          <View className="relative mb-4">
            <Avatar
              uri={profile?.photo_url}
              name={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
              size="xl"
              border={true}
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full items-center justify-center"
              style={Platform.select({ web: { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" } as any, default: {} })}
              onPress={() => router.push("/(applicant)/(profile)/edit")}
            >
              <Camera size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-xl font-bold text-center">
            {profile?.first_name} {profile?.last_name}
          </Text>

          {profile?.city && (
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <MapPin size={13} color="#bfdbfe" />
              <Text className="text-primary-200 text-[13px]">{profile.city}, {profile.country}</Text>
            </View>
          )}

          {profile?.phone && (
            <View className="flex-row items-center gap-1.5 mt-1">
              <Phone size={12} color="#bfdbfe" />
              <Text className="text-primary-200 text-[13px]">{profile.phone}</Text>
            </View>
          )}

          {profile?.bio && (
            <Text className="text-primary-100 text-[13px] text-center mt-4 leading-5 px-2">
              {profile.bio}
            </Text>
          )}
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
