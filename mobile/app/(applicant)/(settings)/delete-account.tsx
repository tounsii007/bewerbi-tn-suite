import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2, AlertTriangle, Lock } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { authApi, IS_API_MODE } from "../../../src/lib/apiClient";
import { apiErrorMessage } from "../../../src/lib/apiError";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";

/**
 * GDPR right-to-erasure. Re-enter password + type the localised
 * confirm phrase → POST /me/delete. The backend revokes every refresh
 * token; we just sign out locally and bounce to /login.
 */
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { signOut, session } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // The confirm phrase is localised so each user types something
  // natural in their own language.
  const confirmPhrase = t("account.delete.confirmPhrase");

  const submit = async () => {
    if (!IS_API_MODE) {
      Alert.alert(t("common.error"), t("account.delete.apiOnly"));
      return;
    }
    if (!password) {
      Alert.alert(t("common.error"), t("account.delete.passwordRequired"));
      return;
    }
    if (confirm.trim() !== confirmPhrase) {
      Alert.alert(
        t("common.error"),
        t("account.delete.confirmRequired", { phrase: confirmPhrase }),
      );
      return;
    }
    setLoading(true);
    try {
      await authApi.deleteAccount(password);
      await signOut();
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert(
        t("common.error"),
        apiErrorMessage(e, t("account.delete.failure")),
      );
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

          <View className="flex-row items-center gap-2 mb-2">
            <Trash2 size={22} color="#dc2626" />
            <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
              {t("account.delete.title")}
            </Text>
          </View>
          {session?.user?.email && (
            <Text className={`text-base mb-2 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
              {session.user.email}
            </Text>
          )}

          <View className="flex-row items-start gap-2 mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle size={16} color="#9f1239" />
            <Text className="flex-1 text-[13px] text-rose-900">
              {t("account.delete.warning")}
            </Text>
          </View>

          <Input
            label={t("account.delete.passwordLabel")}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
          />
          <View style={{ height: 12 }} />
          <Text className={`text-xs mb-1 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
            {t("account.delete.confirmLabel", { phrase: confirmPhrase })}
          </Text>
          <Input
            label=""
            value={confirm}
            onChangeText={setConfirm}
            placeholder={confirmPhrase}
            autoCapitalize="characters"
          />

          <Button
            title={loading ? t("account.delete.busy") : t("account.delete.button")}
            onPress={submit}
            loading={loading}
            size="lg"
            className="w-full mt-4 bg-rose-600"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
