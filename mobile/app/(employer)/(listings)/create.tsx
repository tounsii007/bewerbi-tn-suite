import { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Badge } from "../../../src/components/ui/Badge";
import { Card } from "../../../src/components/ui/Card";
import { useJobStore } from "../../../src/stores/jobStore";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import type { JobCategory, JobType, LanguageLevel } from "../../../src/types";

export default function CreateListingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createJob } = useJobStore();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory>("it");
  const [type, setType] = useState<JobType>("job");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [germanLevel, setGermanLevel] = useState<LanguageLevel>("B1");
  const [saving, setSaving] = useState(false);

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

  const levels: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const handleCreate = async () => {
    if (!title || !description || !location || !profile?.id) {
      Alert.alert(t("common.error"), "Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    setSaving(true);
    try {
      await createJob({
        employer_id: profile.id,
        title,
        description,
        category,
        type,
        location,
        requirements,
        salary_range: salaryRange || null,
        german_level: germanLevel,
        status: "active",
      });
      Alert.alert(t("common.success"), "Stelle erfolgreich erstellt!");
      router.back();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("employer.createListing")}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.springify()}>
          <Input label="Titel *" value={title} onChangeText={setTitle} placeholder="z.B. Software Entwickler (m/w/d)" />
          <Input label="Beschreibung *" value={description} onChangeText={setDescription} placeholder="Beschreibe die Stelle..." multiline numberOfLines={5} />
          <Input label="Standort *" value={location} onChangeText={setLocation} placeholder="z.B. Berlin, München..." />
          <Input label="Gehaltsspanne" value={salaryRange} onChangeText={setSalaryRange} placeholder="z.B. 40.000 - 60.000 €" />
          <Input label="Anforderungen" value={requirements} onChangeText={setRequirements} placeholder="Qualifikationen, Erfahrung..." multiline numberOfLines={4} />

          {/* Category */}
          <Text className={`text-sm font-medium mb-2 ${isDark ? "text-dark-text" : "text-gray-700"}`}>{t("jobs.category")}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {categories.map((c) => (
              <TouchableOpacity key={c.key} onPress={() => setCategory(c.key)}>
                <Badge label={c.label} variant={category === c.key ? "info" : "default"} size="md" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Type */}
          <Text className={`text-sm font-medium mb-2 ${isDark ? "text-dark-text" : "text-gray-700"}`}>{t("jobs.type")}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {types.map((tp) => (
              <TouchableOpacity key={tp.key} onPress={() => setType(tp.key)}>
                <Badge label={tp.label} variant={type === tp.key ? "info" : "default"} size="md" />
              </TouchableOpacity>
            ))}
          </View>

          {/* German Level */}
          <Text className={`text-sm font-medium mb-2 ${isDark ? "text-dark-text" : "text-gray-700"}`}>{t("jobs.germanLevel")}</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {levels.map((l) => (
              <TouchableOpacity key={l} onPress={() => setGermanLevel(l)}>
                <Badge label={l} variant={germanLevel === l ? "info" : "default"} size="md" />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={t("employer.createListing")}
            onPress={handleCreate}
            loading={saving}
            size="lg"
            className="w-full mb-8"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
