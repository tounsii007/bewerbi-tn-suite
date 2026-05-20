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
import {
  Mail,
  Lock,
  User,
  Briefcase,
  ArrowLeft,
  Sparkles,
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
import { useAuthStore } from "../../src/stores/authStore";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import type { UserRole } from "../../src/types";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuthStore();
  const { isDark } = useThemeStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("applicant");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = t("common.required");
    if (!lastName) newErrors.lastName = t("common.required");
    if (!email) newErrors.email = t("common.required");
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = t("common.required");
    else if (password.length < 8) newErrors.password = "Min. 8 Zeichen";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwörter stimmen nicht überein";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email, password, role, firstName, lastName);
      Alert.alert(t("common.success"), t("auth.registerSuccess"));
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        t("common.error"),
        (error as Error).message ?? "Registrierung fehlgeschlagen",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground variant="default" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(80).springify()}
              className="mb-6"
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center gap-1 mb-5 self-start"
              >
                <ArrowLeft size={16} color="#2563EB" />
                <Text className="text-primary-500 text-[14px] font-semibold">
                  {t("common.back")}
                </Text>
              </TouchableOpacity>
              <Text
                className={`text-[13px] font-semibold uppercase mb-1 ${
                  isDark ? "text-primary-300" : "text-primary-600"
                }`}
                style={{ letterSpacing: 1.2 }}
              >
                Neues Konto
              </Text>
              <GradientText
                variant="brand"
                style={{ fontSize: 30, fontWeight: "800", lineHeight: 34 }}
              >
                Willkommen!
              </GradientText>
              <Text
                className={`text-[14px] mt-2 ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                In 60 Sekunden startklar — keine Kreditkarte nötig.
              </Text>
            </Animated.View>

            {/* Role Selection */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              className="mb-5"
            >
              <Text
                className={`text-[12px] font-bold uppercase mb-2 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
                style={{ letterSpacing: 0.8 }}
              >
                Ich bin
              </Text>
              <View className="flex-row gap-3">
                {(["applicant", "employer"] as UserRole[]).map((r) => {
                  const active = role === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRole(r)}
                      activeOpacity={0.85}
                      className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 ${
                        active
                          ? "border-primary-500 bg-primary-500/10"
                          : isDark
                            ? "border-dark-border bg-dark-card/50"
                            : "border-gray-200 bg-white/80"
                      }`}
                      style={
                        active
                          ? {
                              shadowColor: "#2563EB",
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.18,
                              shadowRadius: 12,
                              elevation: 4,
                            }
                          : undefined
                      }
                    >
                      {r === "applicant" ? (
                        <User
                          size={18}
                          color={
                            active
                              ? "#2563EB"
                              : isDark
                                ? "#94a3b8"
                                : "#6b7280"
                          }
                        />
                      ) : (
                        <Briefcase
                          size={18}
                          color={
                            active
                              ? "#2563EB"
                              : isDark
                                ? "#94a3b8"
                                : "#6b7280"
                          }
                        />
                      )}
                      <Text
                        className={`text-[14px] font-bold ${
                          active
                            ? "text-primary-700"
                            : isDark
                              ? "text-dark-text"
                              : "text-gray-700"
                        }`}
                      >
                        {t(`auth.${r}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* Form inside glass card */}
            <Animated.View entering={FadeInDown.delay(220).springify()}>
              <GlassCard strength="strong" glow style={{ padding: 20 }}>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label={t("auth.firstName")}
                      value={firstName}
                      onChangeText={setFirstName}
                      error={errors.firstName}
                      icon={
                        <User
                          size={18}
                          color={isDark ? "#94a3b8" : "#6b7280"}
                        />
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t("auth.lastName")}
                      value={lastName}
                      onChangeText={setLastName}
                      error={errors.lastName}
                    />
                  </View>
                </View>

                <Input
                  label={t("auth.email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  icon={
                    <Mail size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                  }
                />

                <Input
                  label={t("auth.password")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 Zeichen"
                  secureTextEntry
                  error={errors.password}
                  icon={
                    <Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                  }
                />
                <PasswordMeter value={password} />

                <Input
                  label={t("auth.confirmPassword")}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Passwort wiederholen"
                  secureTextEntry
                  error={errors.confirmPassword}
                  icon={
                    <Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                  }
                />

                {loading ? (
                  <Button
                    title={t("auth.register")}
                    onPress={handleRegister}
                    loading
                    size="lg"
                    className="w-full mt-3"
                  />
                ) : (
                  <View className="mt-3">
                    <ShimmerButton
                      onPress={handleRegister}
                      size="lg"
                      style={{ width: "100%" }}
                    >
                      <View className="flex-row items-center gap-2">
                        <Sparkles size={16} color="white" />
                        <Text className="text-white font-bold text-[15px]">
                          {t("auth.register")}
                        </Text>
                      </View>
                    </ShimmerButton>
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8 mb-4">
              <Text
                className={`text-[14px] ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                {t("auth.hasAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-primary-500 text-[14px] font-bold">
                  {t("auth.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuroraBackground>
  );
}
