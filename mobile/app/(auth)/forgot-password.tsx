import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { GradientText } from "../../src/components/ui/GradientText";
import { ShimmerButton } from "../../src/components/ui/ShimmerButton";
import { supabase, IS_MOCK_MODE } from "../../src/lib/supabase";
import { authApi, IS_API_MODE } from "../../src/lib/apiClient";
import { useThemeStore } from "../../src/hooks/useColorScheme";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    try {
      if (IS_API_MODE) {
        await authApi.forgotPassword(email);
        setSent(true);
        return;
      }
      if (IS_MOCK_MODE) {
        setSent(true);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSent(true);
    } catch (error) {
      Alert.alert(t("common.error"), (error as Error)?.message ?? "");
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

          {sent ? (
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <GlassCard strength="strong" glow style={{ padding: 28, alignItems: "center" }}>
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-5"
                  style={{
                    backgroundColor: "rgba(22, 163, 74, 0.15)",
                  }}
                >
                  <CheckCircle2 size={32} color="#16a34a" />
                </View>
                <Text
                  className={`text-[22px] font-extrabold text-center ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  E-Mail unterwegs
                </Text>
                <Text
                  className={`text-[14px] text-center mt-3 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Wenn ein Konto mit dieser Adresse existiert, ist gerade ein
                  Link zum Zurücksetzen unterwegs. Der Link ist{" "}
                  <Text className="font-bold">30 Minuten gültig</Text>.
                </Text>
                <View className="mt-6 w-full">
                  <ShimmerButton
                    onPress={() => router.replace("/(auth)/login")}
                    size="lg"
                    style={{ width: "100%" }}
                  >
                    Zurück zum Login
                  </ShimmerButton>
                </View>
                <Text
                  className={`text-[12px] text-center mt-4 ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  Keine E-Mail? Schau im Spam-Ordner — oder warte 60 Sek.
                </Text>
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
                  Passwort vergessen
                </Text>
                <GradientText
                  variant="brand"
                  style={{ fontSize: 30, fontWeight: "800", lineHeight: 34 }}
                >
                  Kein Problem!
                </GradientText>
                <Text
                  className={`text-[14px] mt-2 leading-5 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Gib deine E-Mail-Adresse ein und wir senden dir einen Link
                  zum Zurücksetzen.
                </Text>
              </View>

              <GlassCard strength="strong" glow style={{ padding: 20 }}>
                <Input
                  label={t("auth.email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                />
                {loading ? (
                  <Button
                    title="Reset-Link senden"
                    onPress={handleReset}
                    loading
                    size="lg"
                    className="w-full mt-3"
                  />
                ) : (
                  <View className="mt-3">
                    <ShimmerButton
                      onPress={handleReset}
                      size="lg"
                      disabled={!email}
                      style={{ width: "100%" }}
                    >
                      <View className="flex-row items-center gap-2">
                        <Mail size={16} color="white" />
                        <Text className="text-white font-bold text-[15px]">
                          Reset-Link senden
                        </Text>
                      </View>
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
