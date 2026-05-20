import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { PasswordMeter } from "../../../src/components/auth/PasswordMeter";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../../src/components/ui/GlassCard";
import { GradientText } from "../../../src/components/ui/GradientText";
import { ShimmerButton } from "../../../src/components/ui/ShimmerButton";
import { authApi, IS_API_MODE } from "../../../src/lib/apiClient";
import { apiErrorMessage } from "../../../src/lib/apiError";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";

/**
 * Authenticated change-password screen. Wraps POST /password/change. The
 * backend revokes every refresh token on success — including ours — so we
 * sign out locally and route to /(auth)/login.
 */
export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { signOut } = useAuthStore();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (newPwd.length < 8) {
      Alert.alert(t("common.error"), "Mindestens 8 Zeichen.");
      return;
    }
    if (newPwd !== confirm) {
      Alert.alert(t("common.error"), "Passwörter stimmen nicht überein.");
      return;
    }
    if (!IS_API_MODE) {
      Alert.alert(t("common.error"), "Funktion nur im API-Modus verfügbar.");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(oldPwd, newPwd);
      setDone(true);
      await signOut();
      setTimeout(() => router.replace("/(auth)/login"), 1200);
    } catch (e) {
      Alert.alert(t("common.error"), apiErrorMessage(e, "Änderung fehlgeschlagen."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-1 mb-6 self-start"
            >
              <ArrowLeft size={16} color="#2563EB" />
              <Text className="text-primary-500 text-[14px] font-semibold">
                {t("common.back")}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {done ? (
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <GlassCard strength="strong" glow style={{ padding: 28, alignItems: "center" }}>
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(22, 163, 74, 0.15)" }}
                >
                  <CheckCircle2 size={32} color="#16a34a" />
                </View>
                <Text
                  className={`text-[22px] font-extrabold text-center ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  Passwort aktualisiert
                </Text>
                <Text
                  className={`text-[14px] text-center mt-3 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Du wirst gleich zum Login weitergeleitet…
                </Text>
                <View className="flex-row items-center gap-1.5 mt-5">
                  <ShieldCheck size={14} color="#16a34a" />
                  <Text className="text-success-500 text-[12px] font-bold">
                    Alle Sessions wurden beendet
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(140).springify()}>
              <View className="mb-6">
                <Text
                  className={`text-[13px] font-semibold uppercase mb-1 ${
                    isDark ? "text-primary-300" : "text-primary-600"
                  }`}
                  style={{ letterSpacing: 1.2 }}
                >
                  Sicherheit
                </Text>
                <GradientText
                  variant="brand"
                  style={{ fontSize: 26, fontWeight: "800", lineHeight: 30 }}
                >
                  Passwort ändern
                </GradientText>
                <Text
                  className={`text-[14px] mt-2 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Du wirst nach der Änderung auf allen Geräten abgemeldet.
                </Text>
              </View>

              <GlassCard strength="strong" glow style={{ padding: 20 }}>
                <Input
                  label="Aktuelles Passwort"
                  value={oldPwd}
                  onChangeText={setOldPwd}
                  placeholder="Aktuelles Passwort"
                  secureTextEntry
                  autoCapitalize="none"
                  icon={<KeyRound size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                />
                <View style={{ height: 12 }} />
                <Input
                  label={t("auth.newPassword")}
                  value={newPwd}
                  onChangeText={setNewPwd}
                  placeholder="Mindestens 8 Zeichen"
                  secureTextEntry
                  autoCapitalize="none"
                  icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                />
                <PasswordMeter value={newPwd} />
                <View style={{ height: 12 }} />
                <Input
                  label={t("auth.confirmPassword")}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Wiederholen"
                  secureTextEntry
                  autoCapitalize="none"
                  icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                />
                {loading ? (
                  <Button
                    title="Passwort speichern"
                    onPress={submit}
                    loading
                    size="lg"
                    className="w-full mt-4"
                  />
                ) : (
                  <View className="mt-4">
                    <ShimmerButton
                      onPress={submit}
                      size="lg"
                      style={{ width: "100%" }}
                    >
                      Passwort speichern
                    </ShimmerButton>
                  </View>
                )}
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
