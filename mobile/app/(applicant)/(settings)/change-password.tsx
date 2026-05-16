import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { PasswordMeter } from "../../../src/components/auth/PasswordMeter";
import { authApi, IS_API_MODE } from "../../../src/lib/apiClient";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";

/**
 * Authenticated change-password screen. Wraps POST /password/change. The
 * backend revokes every refresh token on success — including ours — so we
 * sign out locally and route to /(auth)/login to avoid a stale token bouncing
 * around for the rest of the access-token lifetime.
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
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message ?? "Änderung fehlgeschlagen.");
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
                Passwort ändern
              </Text>
              <Text
                className={`text-base mb-8 ${isDark ? "text-dark-muted" : "text-gray-500"}`}
              >
                Du wirst nach der Änderung auf allen Geräten abgemeldet.
              </Text>
              <Input
                label="Aktuelles Passwort"
                value={oldPwd}
                onChangeText={setOldPwd}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
              />
              <View style={{ height: 12 }} />
              <Input
                label={t("auth.newPassword")}
                value={newPwd}
                onChangeText={setNewPwd}
                placeholder="••••••••"
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
