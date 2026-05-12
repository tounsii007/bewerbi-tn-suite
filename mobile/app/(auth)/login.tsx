import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore } from "../../src/stores/authStore";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { IS_MOCK_MODE } from "../../src/lib/supabase";

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
    } catch (error: any) {
      Alert.alert(t("common.error"), t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Branding */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-10">
            <View
              className="w-24 h-24 bg-primary-500 rounded-3xl items-center justify-center mb-4"
              style={Platform.select({
                web: { boxShadow: "0 8px 30px rgba(37,99,235,0.3)" } as any,
                default: {},
              })}
            >
              <Text className="text-5xl font-bold text-white">B</Text>
              <View className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-accent-500 rounded-full items-center justify-center">
                <Text className="text-white text-[9px] font-bold">.tn</Text>
              </View>
            </View>
            <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
              bewerbi.tn
            </Text>
            <Text className={`text-[15px] mt-1 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
              {t("auth.subtitle")}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
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

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              className="self-end mb-6 mt-2"
            >
              <Text className="text-primary-500 text-[13px] font-medium">{t("auth.forgotPassword")}</Text>
            </TouchableOpacity>

            <Button
              title={t("auth.login")}
              onPress={handleLogin}
              loading={loading}
              size="lg"
              fullWidth={true}
            />
          </Animated.View>

          {/* Register Link */}
          <Animated.View entering={FadeInUp.delay(300).springify()} className="flex-row justify-center mt-8">
            <Text className={`text-[15px] ${isDark ? "text-dark-muted" : "text-gray-500"}`}>{t("auth.noAccount")} </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-primary-500 text-[15px] font-semibold">{t("auth.register")}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Demo Login */}
          {IS_MOCK_MODE && (
            <Animated.View entering={FadeInUp.delay(400).springify()} className="mt-8 pb-8">
              <Text className={`text-center text-[13px] font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-dark-muted" : "text-gray-400"}`}>
                Demo-Modus
              </Text>
              <View className="flex-row gap-3 justify-center">
                <TouchableOpacity
                  className="bg-blue-50 rounded-xl px-4 py-2.5"
                  activeOpacity={0.7}
                  onPress={() => { mockLoginAs("applicant"); router.replace("/(applicant)/(home)"); }}
                >
                  <Text className="text-blue-600 text-[13px] font-semibold">Bewerber</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-emerald-50 rounded-xl px-4 py-2.5"
                  activeOpacity={0.7}
                  onPress={() => { mockLoginAs("employer"); router.replace("/(employer)/(dashboard)"); }}
                >
                  <Text className="text-emerald-600 text-[13px] font-semibold">Arbeitgeber</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-amber-50 rounded-xl px-4 py-2.5"
                  activeOpacity={0.7}
                  onPress={() => { mockLoginAs("admin"); router.replace("/(admin)/users"); }}
                >
                  <Text className="text-amber-600 text-[13px] font-semibold">Admin</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
