import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { GradientText } from "../../src/components/ui/GradientText";
import { GlassCard } from "../../src/components/ui/GlassCard";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { ShimmerButton } from "../../src/components/ui/ShimmerButton";
import { GoogleSignInButton } from "../../src/components/auth/GoogleSignInButton";
import { useAuthStore } from "../../src/stores/authStore";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { IS_MOCK_MODE } from "../../src/lib/supabase";
import { authApi, IS_API_MODE } from "../../src/lib/apiClient";
import { apiErrorMessage } from "../../src/lib/apiError";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, mockLoginAs } = useAuthStore();
  const { isDark } = useThemeStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = t("common.required");
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = t("common.required");
    else if (password.length < 6) newErrors.password = "Min. 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch {
      Alert.alert(t("common.error"), t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground variant="vivid" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingVertical: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Brand + headline */}
            <Animated.View entering={FadeInDown.delay(80).springify()} className="items-center mb-8">
              <View
                className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
                style={{
                  backgroundColor: "#2563EB",
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <Sparkles size={36} color="white" />
              </View>
              <Text
                className={`text-[13px] font-semibold uppercase mb-1.5 ${
                  isDark ? "text-primary-300" : "text-primary-600"
                }`}
                style={{ letterSpacing: 1.2 }}
              >
                Willkommen zurück
              </Text>
              <GradientText
                variant="brand"
                style={{ fontSize: 32, fontWeight: "800", lineHeight: 36 }}
              >
                bewerbi.tn
              </GradientText>
              <Text
                className={`text-[14px] mt-2 text-center ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                {t("auth.subtitle")}
              </Text>
            </Animated.View>

            {/* Form inside glass card */}
            <Animated.View entering={FadeInDown.delay(160).springify()}>
              <GlassCard strength="strong" glow style={{ padding: 24 }}>
                <Input
                  label={t("auth.email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  icon={<Mail size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                />

                <View className="mt-4">
                  <Input
                    label={t("auth.password")}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="********"
                    secureTextEntry={!showPassword}
                    error={errors.password}
                    icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                    ) : (
                      <Eye size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                    )}
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center mt-3 mb-5">
                  <TouchableOpacity
                    onPress={async () => {
                      if (!IS_API_MODE) return;
                      if (!email) {
                        Alert.alert(t("common.error"), "Bitte E-Mail-Adresse eingeben.");
                        return;
                      }
                      try {
                        await authApi.resendVerification(email);
                        Alert.alert(
                          "E-Mail unterwegs",
                          "Wenn die Adresse registriert und noch nicht bestätigt ist, ist ein neuer Link unterwegs.",
                        );
                      } catch (e) {
                        Alert.alert(
                          t("common.error"),
                          apiErrorMessage(e, "Senden fehlgeschlagen."),
                        );
                      }
                    }}
                  >
                    <Text className="text-primary-500 text-[12px] font-semibold">
                      Bestätigung erneut senden
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                    <Text className="text-primary-500 text-[12px] font-semibold">
                      {t("auth.forgotPassword")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Primary CTA */}
                {loading ? (
                  <Button
                    title={t("auth.login")}
                    onPress={handleLogin}
                    loading
                    size="lg"
                    fullWidth
                  />
                ) : (
                  <ShimmerButton
                    onPress={handleLogin}
                    size="lg"
                    style={{ width: "100%" }}
                  >
                    {t("auth.login")}
                  </ShimmerButton>
                )}

                {/* Iter 166 — Google sign-in. Renders only when the
                    EXPO_PUBLIC_GOOGLE_OAUTH_*_CLIENT_ID env vars are
                    set; hidden in dev/mock builds so no confusing
                    "Mit Google anmelden" button appears with no
                    backend wiring. */}
                <View style={{ marginTop: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: isDark
                          ? "rgba(148,163,184,0.25)"
                          : "rgba(0,0,0,0.08)",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: isDark ? "#94a3b8" : "#9ca3af",
                        letterSpacing: 1,
                      }}
                    >
                      ODER
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: isDark
                          ? "rgba(148,163,184,0.25)"
                          : "rgba(0,0,0,0.08)",
                      }}
                    />
                  </View>
                  <GoogleSignInButton text="signin" />
                </View>
              </GlassCard>
            </Animated.View>

            {/* Register link */}
            <Animated.View
              entering={FadeInUp.delay(280).springify()}
              className="flex-row justify-center mt-8"
            >
              <Text
                className={`text-[15px] ${isDark ? "text-dark-muted" : "text-gray-600"}`}
              >
                {t("auth.noAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-primary-500 text-[15px] font-bold">
                  {t("auth.register")}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Demo Login */}
            {IS_MOCK_MODE && (
              <Animated.View
                entering={FadeInUp.delay(360).springify()}
                className="mt-8 pb-8"
              >
                <Text
                  className={`text-center text-[12px] font-semibold uppercase mb-3 ${
                    isDark ? "text-dark-muted" : "text-gray-400"
                  }`}
                  style={{ letterSpacing: 1.5 }}
                >
                  Demo-Modus
                </Text>
                <View className="flex-row gap-3 justify-center">
                  <TouchableOpacity
                    className="bg-blue-50 rounded-xl px-4 py-2.5"
                    activeOpacity={0.7}
                    onPress={() => {
                      mockLoginAs("applicant");
                      router.replace("/(applicant)/(home)");
                    }}
                  >
                    <Text className="text-blue-600 text-[13px] font-semibold">Bewerber</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-emerald-50 rounded-xl px-4 py-2.5"
                    activeOpacity={0.7}
                    onPress={() => {
                      mockLoginAs("employer");
                      router.replace("/(employer)/(dashboard)");
                    }}
                  >
                    <Text className="text-emerald-600 text-[13px] font-semibold">Arbeitgeber</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-amber-50 rounded-xl px-4 py-2.5"
                    activeOpacity={0.7}
                    onPress={() => {
                      mockLoginAs("admin");
                      router.replace("/(admin)/users");
                    }}
                  >
                    <Text className="text-amber-600 text-[13px] font-semibold">Admin</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
