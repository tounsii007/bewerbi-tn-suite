import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, ListPlus, User } from "lucide-react-native";
import { useThemeStore } from "../../src/hooks/useColorScheme";

export default function EmployerLayout() {
  const { t } = useTranslation();
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
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: t("employer.dashboard"),
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(listings)"
        options={{
          title: t("employer.myListings"),
          tabBarIcon: ({ color, size }) => <ListPlus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: t("employer.companyProfile"),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
