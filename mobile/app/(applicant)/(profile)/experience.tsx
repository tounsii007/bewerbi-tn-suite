import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Trash2, Briefcase } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockExperience } from "../../../src/lib/mockData";
import type { Experience } from "../../../src/types";

export default function ExperienceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [items, setItems] = useState<Experience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!profile?.id) return;
    if (IS_MOCK_MODE) {
      setItems(mockExperience.filter(e => e.profile_id === profile.id));
      return;
    }
    const { data } = await supabase.from("experience").select("*").eq("profile_id", profile.id).order("start_date", { ascending: false });
    setItems(data || []);
  };

  const handleSave = async () => {
    if (!profile?.id || !jobTitle || !company) return;
    setSaving(true);
    try {
      if (IS_MOCK_MODE) {
        const newItem: Experience = {
          id: `ex-${Date.now()}`,
          profile_id: profile.id,
          job_title: jobTitle,
          company,
          location,
          description,
          start_date: startDate,
          end_date: endDate || null,
        };
        setItems(prev => [newItem, ...prev]);
        resetForm();
        setSaving(false);
        return;
      }
      const { error } = await supabase.from("experience").insert({
        profile_id: profile.id,
        job_title: jobTitle,
        company,
        location,
        description,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      if (error) throw error;
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(t("common.delete"), "Möchtest du diesen Eintrag löschen?", [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: async () => {
        if (IS_MOCK_MODE) {
          setItems(prev => prev.filter(item => item.id !== id));
          return;
        }
        await supabase.from("experience").delete().eq("id", id); loadData();
      } },
    ]);
  };

  const resetForm = () => { setShowForm(false); setJobTitle(""); setCompany(""); setLocation(""); setDescription(""); setStartDate(""); setEndDate(""); };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{t("profile.experience")}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {showForm && (
          <Animated.View entering={FadeInDown.springify()}>
            <Card className="mb-4">
              <Input label={t("profile.jobTitle")} value={jobTitle} onChangeText={setJobTitle} placeholder="z.B. Software Entwickler..." />
              <Input label={t("profile.company")} value={company} onChangeText={setCompany} placeholder="z.B. Firma GmbH..." />
              <Input label={t("profile.location")} value={location} onChangeText={setLocation} placeholder="z.B. Berlin, Deutschland" />
              <Input label={t("profile.description")} value={description} onChangeText={setDescription} placeholder="Beschreibung deiner Tätigkeiten..." multiline numberOfLines={4} />
              <View className="flex-row gap-3">
                <View className="flex-1"><Input label={t("profile.startDate")} value={startDate} onChangeText={setStartDate} placeholder="JJJJ-MM" /></View>
                <View className="flex-1"><Input label={t("profile.endDate")} value={endDate} onChangeText={setEndDate} placeholder="JJJJ-MM" /></View>
              </View>
              <View className="flex-row gap-3 mt-2">
                <Button title={t("common.cancel")} onPress={resetForm} variant="outline" className="flex-1" />
                <Button title={t("common.save")} onPress={handleSave} loading={saving} className="flex-1" />
              </View>
            </Card>
          </Animated.View>
        )}

        {items.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).springify()}>
            <Card className="mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start gap-3 flex-1">
                  <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mt-0.5">
                    <Briefcase size={20} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{item.job_title}</Text>
                    <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{item.company}</Text>
                    {item.location && <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{item.location}</Text>}
                    <Text className={`text-xs mt-1 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                      {item.start_date} - {item.end_date || t("profile.current")}
                    </Text>
                    {item.description && <Text className={`text-sm mt-2 ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{item.description}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        ))}

        {items.length === 0 && !showForm && (
          <EmptyState
            icon={<Briefcase size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title="Keine Berufserfahrung"
            subtitle="Füge deine Berufserfahrungen hinzu"
            action={<Button title={t("profile.addExperience")} onPress={() => setShowForm(true)} variant="outline" icon={<Plus size={16} color="#2563EB" />} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
