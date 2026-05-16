import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { PasswordMeter } from "../../src/components/auth/PasswordMeter";
import { authApi, IS_API_MODE } from "../../src/lib/apiClient";
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
      Alert.alert(t("common.error"), "Kein Token. Bitte fordere einen neuen Link an.");
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
    } catch (error: any) {
      Alert.alert(t("common.error"), error?.message ?? "Link ungültig oder abgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-1 px-6 pt-6">
        <Animated.View entering={FadeInDown.springify()}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-8"
          >
            <ArrowLeft size={20} color={isDark ? "#e2e8f0" : "#374151"} />
            <Text className={`text-base ${isDark ? "text-dark-text" : "text-gray-700"}`}>
              {t("common.back")}
            </Text>
          </TouchableOpacity>

          {done ? (
            <View className="items-center py-12">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <CheckCircle2 size={32} color="#16a34a" />
              </View>
              <Text
                className={`text-lg font-semibold text-center ${isDark ? "text-dark-text" : "text-gray-900"}`}
              >
                Passwort aktualisiert
              </Text>
              <Text
                className={`text-sm text-center mt-2 ${isDark ? "text-dark-muted" : "text-gray-500"}`}
              >
                Du wirst gleich zum Login weitergeleitet…
              </Text>
            </View>
          ) : (
            <>
              <Text
                className={`text-2xl font-bold mb-2 ${isDark ? "text-dark-text" : "text-gray-900"}`}
              >
                Neues Passwort
              </Text>
              <Text
                className={`text-base mb-8 ${isDark ? "text-dark-muted" : "text-gray-500"}`}
              >
                Du wirst nach dem Setzen auf allen Geräten abgemeldet.
              </Text>

              <Input
                label={t("auth.newPassword")}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
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
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
              />
              <Button
                title="Passwort speichern"
                onPress={submit}
                loading={loading}
                size="lg"
                className="w-full mt-4"
              />
            </>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
