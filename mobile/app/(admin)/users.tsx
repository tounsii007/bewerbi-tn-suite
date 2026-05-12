import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Users, Shield, Briefcase, User, Trash2, LogOut } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Avatar } from "../../src/components/ui/Avatar";
import { Button } from "../../src/components/ui/Button";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { useAuthStore } from "../../src/stores/authStore";
import { supabase, IS_MOCK_MODE } from "../../src/lib/supabase";
import { mockProfiles } from "../../src/lib/mockData";
import type { Profile } from "../../src/types";

const roleConfig = {
  applicant: { label: "Bewerber", variant: "info" as const, icon: User },
  employer: { label: "Arbeitgeber", variant: "success" as const, icon: Briefcase },
  admin: { label: "Admin", variant: "warning" as const, icon: Shield },
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { signOut } = useAuthStore();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    if (IS_MOCK_MODE) {
      setUsers(mockProfiles);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const deleteUser = (id: string) => {
    Alert.alert("Benutzer löschen", "Bist du sicher?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Löschen", style: "destructive",
        onPress: async () => {
          if (IS_MOCK_MODE) {
            setUsers(prev => prev.filter(u => u.id !== id));
            return;
          }
          await supabase.from("profiles").delete().eq("id", id); loadUsers();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>Admin Panel</Text>
          <Text className={`text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{users.length} Benutzer</Text>
        </View>
        <Button
          title=""
          onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
          variant="ghost"
          size="sm"
          icon={<LogOut size={20} color="#DC2626" />}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingTop: 8 }}
        renderItem={({ item, index }) => {
          const role = roleConfig[item.role];
          return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <Card className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <Avatar uri={item.photo_url} name={`${item.first_name} ${item.last_name}`} size="sm" />
                  <View className="flex-1">
                    <Text className={`font-medium ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Badge label={role.label} variant={role.variant} size="sm" />
                      <Text className={`text-xs ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                        {item.city || "N/A"}, {item.country}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteUser(item.id)} className="p-2">
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </Card>
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}
