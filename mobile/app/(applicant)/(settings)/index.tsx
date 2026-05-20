import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globe, Moon, Bell, Shield, FileText, LogOut, ChevronRight, Info, KeyRound, Smartphone, Trash2, Settings as SettingsIcon } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GradientText } from "../../../src/components/ui/GradientText";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import i18n from "../../../src/i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const changeLanguage = () => {
    const langs = [
      { code: "de", label: "Deutsch" },
      { code: "ar", label: "العربية" },
      { code: "fr", label: "Français" },
    ];
    const current = i18n.language;
    const next = langs[(langs.findIndex((l) => l.code === current) + 1) % langs.length];
    i18n.changeLanguage(next.code);
  };

  const handleLogout = () => {
    Alert.alert(t("auth.logout"), "Möchtest du dich abmelden?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => { await signOut(); router.replace("/(auth)/login"); },
      },
    ]);
  };

  const accountItems = [
    { title: t("settings.language"), icon: Globe, color: "#2563EB", bg: "bg-blue-50", onPress: changeLanguage, value: i18n.language === "de" ? "Deutsch" : i18n.language === "ar" ? "العربية" : "Français" },
    { title: t("settings.darkMode"), icon: Moon, color: "#8b5cf6", bg: "bg-violet-50", toggle: true, value: isDark, onToggle: toggleTheme },
    { title: "Passwort ändern", icon: KeyRound, color: "#dc2626", bg: "bg-rose-50", onPress: () => router.push("/(applicant)/(settings)/change-password") },
    { title: "Aktive Sitzungen", icon: Smartphone, color: "#0891b2", bg: "bg-cyan-50", onPress: () => router.push("/(applicant)/(settings)/sessions") },
  ];

  const appItems = [
    { title: t("settings.notifications"), icon: Bell, color: "#f59e0b", bg: "bg-amber-50", onPress: () => {} },
  ];

  const legalItems = [
    { title: t("settings.privacy"), icon: Shield, color: "#10b981", bg: "bg-emerald-50", onPress: () => {} },
    { title: t("settings.terms"), icon: FileText, color: "#6b7280", bg: "bg-gray-100", onPress: () => {} },
    { title: t("settings.about"), icon: Info, color: "#2563EB", bg: "bg-blue-50", onPress: () => {}, value: "v1.0.0" },
  ];

  const renderItem = (item: any, index: number, delayOffset: number) => {
    const Icon = item.icon;
    return (
      <Animated.View key={item.title} entering={FadeInDown.delay((delayOffset + index) * 50).springify()}>
        <TouchableOpacity
          onPress={item.onPress}
          activeOpacity={item.toggle ? 1 : 0.7}
          disabled={!!item.toggle}
        >
          <Card className="flex-row items-center justify-between mb-2" elevation={1}>
            <View className="flex-row items-center gap-4">
              <View className={`w-11 h-11 rounded-xl items-center justify-center ${item.bg}`}>
                <Icon size={20} color={item.color} />
              </View>
              <Text className={`font-semibold text-[15px] ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                {item.title}
              </Text>
            </View>
            {item.toggle ? (
              <Switch
                value={item.value as boolean}
                onValueChange={item.onToggle}
                trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                thumbColor={item.value ? "#2563EB" : "#f4f3f4"}
              />
            ) : (
              <View className="flex-row items-center gap-2">
                {item.value && typeof item.value === "string" && (
                  <Text className={`text-[13px] font-medium ${isDark ? "text-dark-muted" : "text-gray-400"}`}>{item.value}</Text>
                )}
                <ChevronRight size={18} color={isDark ? "#475569" : "#cbd5e1"} />
              </View>
            )}
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()} className="px-5 pt-6 pb-4">
            <View className="flex-row items-start gap-3">
              <LinearGradient
                colors={["#06b6d4", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#06b6d4",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <SettingsIcon size={24} color="white" />
              </LinearGradient>
              <View className="flex-1">
                <GradientText
                  variant="brand"
                  style={{ fontSize: 24, fontWeight: "800", lineHeight: 28 }}
                >
                  {t("settings.title")}
                </GradientText>
                <Text
                  className={`text-[13px] mt-1 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Konto, Sicherheit, Darstellung — alles an einem Ort.
                </Text>
              </View>
            </View>
          </Animated.View>

          <View className="px-5">
            {/* KONTO */}
            <Text
              className={`text-[11px] font-bold uppercase px-1 mt-4 mb-2 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
              style={{ letterSpacing: 1 }}
            >
              Konto
            </Text>
            {accountItems.map((item, index) => renderItem(item, index, 0))}

            {/* APP */}
            <Text
              className={`text-[11px] font-bold uppercase px-1 mt-6 mb-2 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
              style={{ letterSpacing: 1 }}
            >
              App
            </Text>
            {appItems.map((item, index) => renderItem(item, index, 2))}

            {/* RECHTLICHES */}
            <Text
              className={`text-[11px] font-bold uppercase px-1 mt-6 mb-2 ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
              style={{ letterSpacing: 1 }}
            >
              Rechtliches
            </Text>
            {legalItems.map((item, index) => renderItem(item, index, 3))}

            {/* GEFAHRENZONE */}
            <Text
              className="text-[11px] font-bold uppercase px-1 mt-6 mb-2 text-accent-600"
              style={{ letterSpacing: 1 }}
            >
              {t("settings.dangerZone")}
            </Text>
            {renderItem(
              {
                title: t("account.delete.title"),
                icon: Trash2,
                color: "#dc2626",
                bg: "bg-rose-50",
                onPress: () => router.push("/(applicant)/(settings)/delete-account"),
              },
              0,
              5,
            )}

            {/* Logout */}
            <Animated.View entering={FadeInDown.delay(350).springify()} className="mt-8">
              <Button
                title={t("auth.logout")}
                onPress={handleLogout}
                variant="secondary"
                size="lg"
                fullWidth={true}
                icon={<LogOut size={20} color="#ffffff" />}
              />
            </Animated.View>

            {/* Footer */}
            <View className="items-center mt-6 pb-8">
              <Text
                className={`text-[11px] font-bold ${
                  isDark ? "text-dark-muted" : "text-gray-400"
                }`}
              >
                bewerbi.tn v1.0.0
              </Text>
              <Text
                className={`text-[10px] mt-1 ${
                  isDark ? "text-dark-muted" : "text-gray-400"
                }`}
              >
                Made with ♥ in Tunisia
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
