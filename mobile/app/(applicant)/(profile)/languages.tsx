import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Trash2, Languages as LanguagesIcon } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockLanguages } from "../../../src/lib/mockData";
import type { LanguageSkill, LanguageLevel } from "../../../src/types";

const levels: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function LanguagesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [items, setItems] = useState<LanguageSkill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState<LanguageLevel>("A1");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!profile?.id) return;
    if (IS_MOCK_MODE) {
      setItems(mockLanguages.filter(l => l.profile_id === profile.id));
      return;
    }
    const { data } = await supabase.from("language_skills").select("*").eq("profile_id", profile.id);
    setItems(data || []);
  };

  const handleSave = async () => {
    if (!profile?.id || !language) return;
    setSaving(true);
    try {
      if (IS_MOCK_MODE) {
        const newItem: LanguageSkill = {
          id: `l-${Date.now()}`,
          profile_id: profile.id,
          language,
          level,
        };
        setItems(prev => [...prev, newItem]);
        setShowForm(false);
        setLanguage("");
        setLevel("A1");
        setSaving(false);
        return;
      }
      const { error } = await supabase.from("language_skills").insert({ profile_id: profile.id, language, level });
      if (error) throw error;
      setShowForm(false);
      setLanguage("");
      setLevel("A1");
      loadData();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (IS_MOCK_MODE) {
      setItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    await supabase.from("language_skills").delete().eq("id", id);
    loadData();
  };

  const levelColor = (l: LanguageLevel): "error" | "warning" | "info" | "success" => {
    if (l <= "A2") return "error";
    if (l <= "B1") return "warning";
    if (l <= "B2") return "info";
    return "success";
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{t("profile.languages")}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {showForm && (
          <Animated.View entering={FadeInDown.springify()}>
            <Card className="mb-4">
              <Input label={t("profile.language")} value={language} onChangeText={setLanguage} placeholder="z.B. Deutsch, Englisch..." />
              <Text className={`text-sm font-medium mb-2 ${isDark ? "text-dark-text" : "text-gray-700"}`}>{t("profile.level")}</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {levels.map((l) => (
                  <TouchableOpacity key={l} onPress={() => setLevel(l)}>
                    <Badge label={l} variant={level === l ? "info" : "default"} size="md" />
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row gap-3">
                <Button title={t("common.cancel")} onPress={() => setShowForm(false)} variant="outline" className="flex-1" />
                <Button title={t("common.save")} onPress={handleSave} loading={saving} className="flex-1" />
              </View>
            </Card>
          </Animated.View>
        )}

        {items.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).springify()}>
            <Card className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center">
                  <LanguagesIcon size={20} color="#8b5cf6" />
                </View>
                <View>
                  <Text className={`font-medium ${isDark ? "text-dark-text" : "text-gray-900"}`}>{item.language}</Text>
                  <Badge label={item.level} variant={levelColor(item.level)} size="sm" />
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            </Card>
          </Animated.View>
        ))}

        {items.length === 0 && !showForm && (
          <EmptyState
            icon={<LanguagesIcon size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title="Keine Sprachkenntnisse"
            subtitle="Füge deine Sprachkenntnisse und Niveaus hinzu"
            action={<Button title={t("profile.addLanguage")} onPress={() => setShowForm(true)} variant="outline" icon={<Plus size={16} color="#2563EB" />} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
