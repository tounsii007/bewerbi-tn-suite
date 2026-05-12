import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Trash2, GraduationCap } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockEducation } from "../../../src/lib/mockData";
import type { Education } from "../../../src/types";

export default function EducationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [items, setItems] = useState<Education[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [country, setCountry] = useState("Tunesien");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!profile?.id) return;
    if (IS_MOCK_MODE) {
      setItems(mockEducation.filter(e => e.profile_id === profile.id));
      return;
    }
    const { data } = await supabase
      .from("education")
      .select("*")
      .eq("profile_id", profile.id)
      .order("start_date", { ascending: false });
    setItems(data || []);
  };

  const handleSave = async () => {
    if (!profile?.id || !degree || !institution) return;
    setSaving(true);
    try {
      if (IS_MOCK_MODE) {
        const newItem: Education = {
          id: `e-${Date.now()}`,
          profile_id: profile.id,
          degree,
          institution,
          field_of_study: fieldOfStudy,
          country,
          start_date: startDate,
          end_date: endDate || null,
        };
        setItems(prev => [newItem, ...prev]);
        resetForm();
        setSaving(false);
        return;
      }
      const { error } = await supabase.from("education").insert({
        profile_id: profile.id,
        degree,
        institution,
        field_of_study: fieldOfStudy,
        country,
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
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (IS_MOCK_MODE) {
            setItems(prev => prev.filter(item => item.id !== id));
            return;
          }
          await supabase.from("education").delete().eq("id", id);
          loadData();
        },
      },
    ]);
  };

  const resetForm = () => {
    setShowForm(false);
    setDegree("");
    setInstitution("");
    setFieldOfStudy("");
    setCountry("Tunesien");
    setStartDate("");
    setEndDate("");
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {t("profile.education")}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {showForm && (
          <Animated.View entering={FadeInDown.springify()}>
            <Card className="mb-4">
              <Input label={t("profile.degree")} value={degree} onChangeText={setDegree} placeholder="z.B. Bachelor, Master, Licence..." />
              <Input label={t("profile.institution")} value={institution} onChangeText={setInstitution} placeholder="z.B. Universität Tunis..." />
              <Input label={t("profile.fieldOfStudy")} value={fieldOfStudy} onChangeText={setFieldOfStudy} placeholder="z.B. Informatik..." />
              <Input label={t("profile.country")} value={country} onChangeText={setCountry} />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input label={t("profile.startDate")} value={startDate} onChangeText={setStartDate} placeholder="JJJJ-MM" />
                </View>
                <View className="flex-1">
                  <Input label={t("profile.endDate")} value={endDate} onChangeText={setEndDate} placeholder="JJJJ-MM" />
                </View>
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
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mt-0.5">
                    <GraduationCap size={20} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{item.degree}</Text>
                    <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{item.institution}</Text>
                    {item.field_of_study && (
                      <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{item.field_of_study}</Text>
                    )}
                    <Text className={`text-xs mt-1 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                      {item.start_date} - {item.end_date || t("profile.current")} | {item.country}
                    </Text>
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
            icon={<GraduationCap size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title="Keine Bildungseinträge"
            subtitle="Füge deine Bildungsabschlüsse und Studiengänge hinzu"
            action={
              <Button
                title={t("profile.addEducation")}
                onPress={() => setShowForm(true)}
                variant="outline"
                icon={<Plus size={16} color="#2563EB" />}
              />
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
