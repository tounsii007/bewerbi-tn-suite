import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Home, Search, FileText, User, Settings } from "lucide-react-native";
import { Platform } from "react-native";
import { useThemeStore } from "../../src/hooks/useColorScheme";

export default function ApplicantLayout() {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          height: Platform.OS === "ios" ? 88 : 64,
          ...(Platform.OS === "web" ? {
            boxShadow: "0 -4px 20px rgba(0,0,0,0.04)",
          } as any : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: t("common.search"),
          tabBarIcon: ({ color }) => <Search size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="(applications)"
        options={{
          title: "Bewerbungen",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: t("settings.title"),
          tabBarIcon: ({ color }) => <Settings size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
