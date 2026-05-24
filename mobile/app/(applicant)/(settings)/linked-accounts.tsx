import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Check,
  KeyRound,
  Link2,
  Link2Off,
  ShieldCheck,
  Lock as LockIcon,
} from "lucide-react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { GoogleGlyph } from "../../../src/components/auth/GoogleGlyph";
import { authApi } from "../../../src/lib/apiClient";
import { apiErrorMessage } from "../../../src/lib/apiError";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GradientText } from "../../../src/components/ui/GradientText";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { Input } from "../../../src/components/ui/Input";
import { PasswordMeter } from "../../../src/components/auth/PasswordMeter";

WebBrowser.maybeCompleteAuthSession();

/**
 * Iter 169 — mobile "Verknüpfte Konten" screen.
 *
 * Mirrors the web's `<LinkedAccountsCard>`. Lets a password user link
 * Google, a Google-only user add a password, and a linked user
 * unlink Google (rejected if no password — would lock them out).
 *
 * Auto-refreshes the auth-store flags after each operation by calling
 * `authStore.refreshAccount()` so the buttons re-render correctly.
 */
export default function LinkedAccountsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.session?.user);
  const refreshAccount = useAuthStore((s) => s.refreshAccount);
  const signOut = useAuthStore((s) => s.signOut);

  // Iter 191 — the settings _layout fires refreshAccount() on
  // Settings-tab entry, so all sub-screens (this one included) see
  // fresh flags without each one having to wire its own useEffect.

  if (!user) {
    return (
      <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
        <SafeAreaView className="flex-1 items-center justify-center" edges={["top"]}>
          <Text className={isDark ? "text-dark-muted" : "text-gray-500"}>
            {t("auth.loginAgain")}
          </Text>
        </SafeAreaView>
      </AuroraBackground>
    );
  }

  const { hasPassword, hasGoogleLinked } = user;

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
          <Animated.View entering={FadeIn.springify()}>
            <View className="flex-row items-center mb-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-3 -ml-2 p-2"
                accessibilityLabel={t("common.back")}
              >
                <ArrowLeft size={22} color={isDark ? "#e2e8f0" : "#0f172a"} />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-start gap-3 mb-6">
              <LinearGradient
                colors={["#8b5cf6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#8b5cf6",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Link2 size={24} color="white" />
              </LinearGradient>
              <View className="flex-1">
                <GradientText
                  variant="brand"
                  style={{ fontSize: 22, fontWeight: "800", lineHeight: 26 }}
                >
                  {t("settings.linkedAccounts")}
                </GradientText>
                <Text
                  className={`text-[13px] mt-1 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  {t("settings.linkedAccountsSub")}
                </Text>
              </View>
            </View>

            {/* Method status */}
            <Card className="mb-3" elevation={1}>
              <MethodRow
                icon={<KeyRound size={18} color={isDark ? "#94a3b8" : "#6b7280"} />}
                title={t("auth.methodPassword")}
                subtitle={hasPassword ? t("auth.passwordActive") : t("auth.passwordMissing")}
                active={!!hasPassword}
                isDark={isDark}
              />
            </Card>

            <Card className="mb-5" elevation={1}>
              <MethodRow
                icon={<GoogleGlyph />}
                title={t("auth.methodGoogle")}
                subtitle={hasGoogleLinked ? t("auth.googleActive") : t("auth.googleMissing")}
                active={!!hasGoogleLinked}
                isDark={isDark}
              />
            </Card>

            {/* Actions branch on state */}
            {!hasGoogleLinked && hasPassword && (
              <LinkGoogleSection onLinked={() => refreshAccount()} />
            )}
            {hasGoogleLinked && hasPassword && (
              <UnlinkGoogleSection onUnlinked={() => refreshAccount()} />
            )}
            {!hasPassword && (
              <SetInitialPasswordSection
                onSet={async () => {
                  Alert.alert(
                    t("auth.setPasswordSuccessTitle"),
                    t("auth.setPasswordSuccess"),
                  );
                  await signOut();
                  router.replace("/(auth)/login");
                }}
              />
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AuroraBackground>
  );
}

function MethodRow({
  icon,
  title,
  subtitle,
  active,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active: boolean;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-start gap-3">
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${
          isDark ? "bg-dark-bg-alt" : "bg-gray-100"
        }`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-[15px] font-bold ${
              isDark ? "text-dark-text" : "text-gray-900"
            }`}
          >
            {title}
          </Text>
          {active && (
            <View className="flex-row items-center gap-1 bg-emerald-50 rounded-full px-2 py-0.5">
              <Check size={11} color="#059669" />
              <Text className="text-emerald-700 text-[10px] font-bold">
                {t("auth.statusActive")}
              </Text>
            </View>
          )}
        </View>
        <Text
          className={`text-[12px] mt-1 ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function LinkGoogleSection({ onLinked }: { onLinked: () => Promise<void> }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const [, , promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
    scopes: ["openid", "email", "profile"],
  });

  const oauthConfigured = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID
      || process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID
      || process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  );
  if (!oauthConfigured) {
    return (
      <Card elevation={1}>
        <Text className="text-[13px] text-gray-500">
          {t("auth.googleNotConfigured")}
        </Text>
      </Card>
    );
  }

  const handlePress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        if (result.type === "error") {
          Alert.alert("Google", result.error?.message ?? t("auth.linkGoogle"));
        }
        return;
      }
      const idToken =
        result.authentication?.idToken
        ?? (result.params as Record<string, string>)?.id_token;
      if (!idToken) {
        Alert.alert("Google", t("auth.noIdToken"));
        return;
      }
      await authApi.linkGoogle(idToken);
      Alert.alert(t("common.success"), t("auth.linkGoogleSuccess"));
      await onLinked();
    } catch (e) {
      Alert.alert("Google", apiErrorMessage(e, t("auth.linkGoogle")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card elevation={1}>
      <View className="flex-row items-start gap-2 mb-3">
        <ShieldCheck size={16} color="#2563EB" style={{ marginTop: 2 }} />
        <Text className="flex-1 text-[12px] text-gray-600">
          {t("auth.linkGoogleWhy")}
        </Text>
      </View>
      <Button
        title={busy ? `${t("auth.linkGoogle")}…` : t("auth.linkGoogle")}
        onPress={handlePress}
        loading={busy}
        size="lg"
        fullWidth
        icon={<Link2 size={18} color="#ffffff" />}
      />
    </Card>
  );
}

function UnlinkGoogleSection({ onUnlinked }: { onUnlinked: () => Promise<void> }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const handleUnlink = () => {
    Alert.alert(
      t("auth.unlinkGoogle"),
      t("auth.unlinkGoogleConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("auth.unlinkGoogle"),
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await authApi.unlinkGoogle();
              Alert.alert(t("common.success"), t("auth.unlinkGoogleSuccess"));
              await onUnlinked();
            } catch (e) {
              Alert.alert(t("common.error"), apiErrorMessage(e, t("auth.unlinkGoogle")));
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Card elevation={1}>
      <View className="flex-row items-start gap-2 mb-3">
        <ShieldCheck size={16} color="#059669" style={{ marginTop: 2 }} />
        <Text className="flex-1 text-[12px] text-gray-600">
          {t("auth.unlinkGoogleWhy")}
        </Text>
      </View>
      <Button
        title={busy ? `${t("auth.unlinkGoogle")}…` : t("auth.unlinkGoogle")}
        onPress={handleUnlink}
        loading={busy}
        variant="secondary"
        size="lg"
        fullWidth
        icon={<Link2Off size={18} color="#ffffff" />}
      />
    </Card>
  );
}

function SetInitialPasswordSection({ onSet }: { onSet: () => Promise<void> }) {
  const { t } = useTranslation();
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSet = async () => {
    if (newPwd.length < 8) {
      Alert.alert(t("common.error"), t("auth.setPasswordTooShort"));
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert(t("common.error"), t("auth.setPasswordMismatch"));
      return;
    }
    setBusy(true);
    try {
      await authApi.setInitialPassword(newPwd);
      await onSet();
    } catch (e) {
      Alert.alert(t("common.error"), apiErrorMessage(e, t("auth.setPasswordCta")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card elevation={1}>
      <View className="flex-row items-start gap-2 mb-3">
        <LockIcon size={16} color="#2563EB" style={{ marginTop: 2 }} />
        <Text className="flex-1 text-[12px] text-gray-600">
          {t("auth.setPasswordWhy")}
        </Text>
      </View>
      <Input
        label={t("auth.setPasswordNewLabel")}
        value={newPwd}
        onChangeText={setNewPwd}
        secureTextEntry
      />
      <View style={{ marginTop: 8 }}>
        <PasswordMeter value={newPwd} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Input
          label={t("auth.setPasswordConfirmLabel")}
          value={confirmPwd}
          onChangeText={setConfirmPwd}
          secureTextEntry
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <Button
          title={busy ? `${t("common.save")}…` : t("auth.setPasswordCta")}
          onPress={handleSet}
          loading={busy}
          disabled={!newPwd || !confirmPwd}
          size="lg"
          fullWidth
          icon={<KeyRound size={18} color="#ffffff" />}
        />
      </View>
    </Card>
  );
}

