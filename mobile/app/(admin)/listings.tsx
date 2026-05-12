import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { Trash2, MapPin } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../src/lib/supabase";
import { mockJobs } from "../../src/lib/mockData";
import type { Job } from "../../src/types";

export default function AdminListingsScreen() {
  const { isDark } = useThemeStore();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    if (IS_MOCK_MODE) {
      setJobs(mockJobs);
      return;
    }
    const { data } = await supabase.from("jobs").select("*, employer:profiles(*)").order("created_at", { ascending: false });
    setJobs(data || []);
  };

  const deleteJob = (id: string) => {
    Alert.alert("Stelle löschen", "Bist du sicher?", [
      { text: "Abbrechen", style: "cancel" },
      { text: "Löschen", style: "destructive", onPress: async () => {
        if (IS_MOCK_MODE) {
          setJobs(prev => prev.filter(j => j.id !== id));
          return;
        }
        await supabase.from("jobs").delete().eq("id", id); loadJobs();
      } },
    ]);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    if (IS_MOCK_MODE) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus as Job["status"] } : j));
      return;
    }
    await supabase.from("jobs").update({ status: newStatus }).eq("id", id);
    loadJobs();
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="px-6 pt-4 pb-2">
        <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>Alle Anzeigen</Text>
        <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{jobs.length} Anzeigen</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingTop: 8 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <Card className="mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row gap-2 mb-1">
                    <Badge label={item.type} variant="info" />
                    <Badge label={item.category} />
                  </View>
                  <Text className={`font-semibold mt-1 ${isDark ? "text-dark-text" : "text-gray-900"}`}>{item.title}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MapPin size={12} color={isDark ? "#94a3b8" : "#6b7280"} />
                    <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{item.location}</Text>
                  </View>
                  {item.employer && (
                    <Text className={`text-xs mt-0.5 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                      von {item.employer.first_name} {item.employer.last_name}
                    </Text>
                  )}
                </View>
                <View className="items-end gap-2">
                  <TouchableOpacity onPress={() => toggleStatus(item.id, item.status)}>
                    <Badge
                      label={item.status === "active" ? "Aktiv" : "Geschlossen"}
                      variant={item.status === "active" ? "success" : "error"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteJob(item.id)}>
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}
