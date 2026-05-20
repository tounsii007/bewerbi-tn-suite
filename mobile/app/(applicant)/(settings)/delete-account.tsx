import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2, AlertTriangle, Lock } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../../src/components/ui/GlassCard";
import { authApi, IS_API_MODE } from "../../../src/lib/apiClient";
import { apiErrorMessage } from "../../../src/lib/apiError";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";

/**
 * GDPR right-to-erasure. Re-enter password + type the localised
 * confirm phrase → POST /me/delete.
 */
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { signOut, session } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

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

          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <View className="flex-row items-start gap-3 mb-3">
              <LinearGradient
                colors={["#DC2626", "#9F1239"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#DC2626",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Trash2 size={22} color="white" />
              </LinearGradient>
              <View className="flex-1">
                <Text
                  className={`text-[13px] font-semibold uppercase ${
                    isDark ? "text-accent-300" : "text-accent-600"
                  }`}
                  style={{ letterSpacing: 1.2 }}
                >
                  Gefahrenzone
                </Text>
                <Text
                  className={`text-[22px] font-extrabold mt-0.5 ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  {t("account.delete.title")}
                </Text>
                {session?.user?.email && (
                  <Text
                    className={`text-[13px] mt-1 ${
                      isDark ? "text-dark-muted" : "text-gray-600"
                    }`}
                  >
                    {session.user.email}
                  </Text>
                )}
              </View>
            </View>

            <GlassCard
              strength="default"
              style={{
                padding: 14,
                marginBottom: 16,
                borderColor: "rgba(220, 38, 38, 0.25)",
              }}
            >
              <View className="flex-row items-start gap-2">
                <AlertTriangle size={16} color="#DC2626" />
                <Text
                  className={`flex-1 text-[13px] leading-5 ${
                    isDark ? "text-dark-text" : "text-gray-700"
                  }`}
                >
                  {t("account.delete.warning")}
                </Text>
              </View>
            </GlassCard>

            <GlassCard strength="strong" style={{ padding: 20 }}>
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
              <Text
                className={`text-[12px] mb-1.5 ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
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
                title={
                  loading ? t("account.delete.busy") : t("account.delete.button")
                }
                onPress={submit}
                loading={loading}
                size="lg"
                className="w-full mt-4 bg-rose-600"
              />
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
