import { Tabs } from "expo-router";
import { Users, ListPlus, BarChart3 } from "lucide-react-native";
import { useThemeStore } from "../../src/hooks/useColorScheme";

export default function AdminLayout() {
  const { isDark } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#9ca3af",
        tabBarStyle: {
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderTopColor: isDark ? "#334155" : "#f1f5f9",
          borderTopWidth: 1,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="users" options={{ title: "Benutzer", tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }} />
      <Tabs.Screen name="listings" options={{ title: "Anzeigen", tabBarIcon: ({ color, size }) => <ListPlus size={size} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: "Berichte", tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} /> }} />
    </Tabs>
  );
}
