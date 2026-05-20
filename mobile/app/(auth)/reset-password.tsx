import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { PasswordMeter } from "../../src/components/auth/PasswordMeter";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { GradientText } from "../../src/components/ui/GradientText";
import { ShimmerButton } from "../../src/components/ui/ShimmerButton";
import { authApi, IS_API_MODE } from "../../src/lib/apiClient";
import { apiErrorMessage } from "../../src/lib/apiError";
import { useThemeStore } from "../../src/hooks/useColorScheme";

/**
 * Deep-link target for password-reset emails:
 *   bewerbi://reset-password?token=...
 *
 * Reached from the link in the reset email rendered by notification-service.
 * No auth required; the token *is* the credential.
 */
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = useMemo(() => {
    const raw = Array.isArray(params.token) ? params.token[0] : params.token;
    return raw ?? "";
  }, [params.token]);

  const { isDark } = useThemeStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) {
      Alert.alert(
        t("common.error"),
        "Kein Token. Bitte fordere einen neuen Link an.",
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert(t("common.error"), "Mindestens 8 Zeichen.");
      return;
    }
    if (password !== confirm) {
      Alert.alert(t("common.error"), "Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    try {
      if (IS_API_MODE) {
        await authApi.resetPassword(token, password);
      }
      setDone(true);
      setTimeout(() => router.replace("/(auth)/login"), 1500);
    } catch (error) {
      Alert.alert(
        t("common.error"),
        apiErrorMessage(error, "Link ungültig oder abgelaufen."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground variant="default" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 32,
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

          {!token ? (
            // Invalid-token state
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <GlassCard
                strength="strong"
                style={{ padding: 28, alignItems: "center" }}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(220, 38, 38, 0.15)" }}
                >
                  <XCircle size={32} color="#DC2626" />
                </View>
                <Text
                  className={`text-[22px] font-extrabold text-center ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  Link unvollständig
                </Text>
                <Text
                  className={`text-[14px] text-center mt-3 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Dieser Link enthält kein gültiges Token. Bitte fordere einen
                  neuen Reset-Link an.
                </Text>
                <View className="mt-6 w-full">
                  <ShimmerButton
                    onPress={() => router.replace("/(auth)/forgot-password")}
                    size="lg"
                    style={{ width: "100%" }}
                  >
                    Neuen Link anfordern
                  </ShimmerButton>
                </View>
              </GlassCard>
            </Animated.View>
          ) : done ? (
            // Success state
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <GlassCard
                strength="strong"
                glow
                style={{ padding: 28, alignItems: "center" }}
              >
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
            // Form state
            <Animated.View entering={FadeInDown.delay(140).springify()}>
              <View className="mb-6">
                <Text
                  className={`text-[13px] font-semibold uppercase mb-1 ${
                    isDark ? "text-primary-300" : "text-primary-600"
                  }`}
                  style={{ letterSpacing: 1.2 }}
                >
                  Passwort zurücksetzen
                </Text>
                <GradientText
                  variant="brand"
                  style={{ fontSize: 28, fontWeight: "800", lineHeight: 32 }}
                >
                  Neues Passwort wählen
                </GradientText>
                <Text
                  className={`text-[14px] mt-2 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Wähle ein starkes Passwort — die Stärke wird live geprüft.
                </Text>
              </View>

              <GlassCard strength="strong" glow style={{ padding: 20 }}>
                <Input
                  label={t("auth.newPassword")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mindestens 8 Zeichen"
                  secureTextEntry
                  autoCapitalize="none"
                  icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                />
                <PasswordMeter value={password} />
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
                <Text
                  className={`text-[11px] text-center mt-3 ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  Nach dem Speichern werden alle aktiven Sessions abgemeldet.
                </Text>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
