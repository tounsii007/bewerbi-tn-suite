import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, Briefcase } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
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
    else if (password.length < 6) newErrors.password = "Min. 6 Zeichen";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwörter stimmen nicht überein";
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
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
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
          className="flex-1 px-6"
          contentContainerStyle={{ paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-primary-500 text-base">{t("common.back")}</Text>
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
              {t("auth.register")}
            </Text>
            <Text className={`text-base mt-1 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
              {t("auth.subtitle")}
            </Text>
          </Animated.View>

          {/* Role Selection */}
          <Animated.View entering={FadeInDown.delay(150).springify()} className="mb-6">
            <Text className={`text-sm font-medium mb-3 ${isDark ? "text-dark-text" : "text-gray-700"}`}>
              {t("auth.iAmA")}
            </Text>
            <View className="flex-row gap-3">
              {(["applicant", "employer"] as UserRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl border-2 ${
                    role === r
                      ? "border-primary-500 bg-primary-50"
                      : isDark
                      ? "border-dark-border bg-dark-card"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {r === "applicant" ? (
                    <User size={20} color={role === r ? "#2563EB" : isDark ? "#94a3b8" : "#6b7280"} />
                  ) : (
                    <Briefcase size={20} color={role === r ? "#2563EB" : isDark ? "#94a3b8" : "#6b7280"} />
                  )}
                  <Text
                    className={`font-medium ${
                      role === r ? "text-primary-500" : isDark ? "text-dark-text" : "text-gray-700"
                    }`}
                  >
                    {t(`auth.${r}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t("auth.firstName")}
                  value={firstName}
                  onChangeText={setFirstName}
                  error={errors.firstName}
                  icon={<User size={18} color={isDark ? "#94a3b8" : "#6b7280"} />}
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
              icon={<Mail size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
            />

            <Input
              label={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 Zeichen"
              secureTextEntry
              error={errors.password}
              icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
            />

            <Input
              label={t("auth.confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Passwort wiederholen"
              secureTextEntry
              error={errors.confirmPassword}
              icon={<Lock size={20} color={isDark ? "#94a3b8" : "#6b7280"} />}
            />

            <Button
              title={t("auth.register")}
              onPress={handleRegister}
              loading={loading}
              size="lg"
              className="w-full mt-2"
            />
          </Animated.View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className={`${isDark ? "text-dark-muted" : "text-gray-500"}`}>{t("auth.hasAccount")} </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text className="text-primary-500 font-semibold">{t("auth.login")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
