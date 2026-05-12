import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { supabase, IS_MOCK_MODE } from "../../src/lib/supabase";
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
      if (IS_MOCK_MODE) {
        setSent(true);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-1 px-6 pt-6">
        <Animated.View entering={FadeInDown.springify()}>
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-8">
            <ArrowLeft size={20} color={isDark ? "#e2e8f0" : "#374151"} />
            <Text className={`text-base ${isDark ? "text-dark-text" : "text-gray-700"}`}>{t("common.back")}</Text>
          </TouchableOpacity>

          <Text className={`text-2xl font-bold mb-2 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {t("auth.resetPassword")}
          </Text>
          <Text className={`text-base mb-8 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zur&#252;cksetzen.
          </Text>

          {sent ? (
            <View className="items-center py-8">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Mail size={32} color="#16a34a" />
              </View>
              <Text className={`text-lg font-semibold text-center ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                E-Mail gesendet!
              </Text>
              <Text className={`text-sm text-center mt-2 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
                Pr&#252;fe dein Postfach f&#252;r den Reset-Link.
              </Text>
              <Button
                title={t("auth.login")}
                onPress={() => router.replace("/(auth)/login")}
                variant="outline"
                className="mt-6"
              />
            </View>
          ) : (
            <>
              <Input
                label={t("auth.email")}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
              />
              <Button
                title={t("auth.resetPassword")}
                onPress={handleReset}
                loading={loading}
                size="lg"
                className="w-full mt-2"
              />
            </>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
