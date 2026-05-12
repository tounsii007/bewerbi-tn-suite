import { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus, Briefcase } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Button } from "../../../src/components/ui/Button";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { useJobStore } from "../../../src/stores/jobStore";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";

export default function ListingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { myListings, fetchMyListings } = useJobStore();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (profile?.id) fetchMyListings(profile.id);
  }, [profile?.id]);

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("employer.myListings")}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(employer)/(listings)/create")}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingTop: 12 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
            <Card className="mb-3" onPress={() => router.push(`/(employer)/(listings)/${item.id}`)}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row gap-2 mb-1">
                    <Badge label={t(`jobs.${item.type}`)} variant="info" />
                    <Badge label={t(`jobs.${item.category}`)} />
                  </View>
                  <Text className={`text-base font-semibold mt-1 ${isDark ? "text-dark-text" : "text-gray-900"}`}>{item.title}</Text>
                  <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{item.location}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${item.status === "active" ? "bg-green-100" : "bg-gray-100"}`}>
                  <Text className={`text-xs font-medium ${item.status === "active" ? "text-green-800" : "text-gray-600"}`}>
                    {item.status === "active" ? "Aktiv" : "Geschlossen"}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Briefcase size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title="Keine Stellenanzeigen"
            subtitle="Erstelle deine erste Stellenanzeige"
            action={
              <Button
                title={t("employer.createListing")}
                onPress={() => router.push("/(employer)/(listings)/create")}
                icon={<Plus size={16} color="#fff" />}
              />
            }
          />
        }
      />
    </SafeAreaView>
  );
}
