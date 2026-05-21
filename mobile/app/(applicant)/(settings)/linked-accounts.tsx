import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
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
import { Svg, Path } from "react-native-svg";
import { authApi, IS_API_MODE } from "../../../src/lib/apiClient";
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
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.session?.user);
  const refreshAccount = useAuthStore((s) => s.refreshAccount);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    // Pull fresh flags on screen mount so a user who linked on web
    // sees the up-to-date state when they open the mobile screen.
    if (IS_API_MODE) void refreshAccount();
  }, [refreshAccount]);

  if (!user) {
    return (
      <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
        <SafeAreaView className="flex-1 items-center justify-center" edges={["top"]}>
          <Text className={isDark ? "text-dark-muted" : "text-gray-500"}>
            Bitte einloggen.
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
                accessibilityLabel="Zurück"
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
                  Verknüpfte Konten
                </GradientText>
                <Text
                  className={`text-[13px] mt-1 ${
                    isDark ? "text-dark-muted" : "text-gray-600"
                  }`}
                >
                  Verwalte wie du dich anmelden kannst — Passwort, Google,
                  oder beide.
                </Text>
              </View>
            </View>

            {/* Method status */}
            <Card className="mb-3" elevation={1}>
              <MethodRow
                icon={<KeyRound size={18} color={isDark ? "#94a3b8" : "#6b7280"} />}
                title="Passwort"
                subtitle={hasPassword
                  ? "Aktiv — du kannst dich mit E-Mail + Passwort anmelden."
                  : "Nicht gesetzt — füge ein Passwort hinzu."}
                active={!!hasPassword}
                isDark={isDark}
              />
            </Card>

            <Card className="mb-5" elevation={1}>
              <MethodRow
                icon={<GoogleGlyph />}
                title="Google"
                subtitle={hasGoogleLinked
                  ? "Verknüpft — du kannst dich mit Google anmelden."
                  : "Nicht verknüpft."}
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
                    "Passwort gesetzt",
                    "Bitte melde dich erneut an.",
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
                Aktiv
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
          Google-Anmeldung ist in diesem Build nicht konfiguriert.
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
          Alert.alert("Google", result.error?.message ?? "Verknüpfung fehlgeschlagen");
        }
        return;
      }
      const idToken =
        result.authentication?.idToken
        ?? (result.params as Record<string, string>)?.id_token;
      if (!idToken) {
        Alert.alert("Google", "Kein ID-Token von Google erhalten.");
        return;
      }
      await authApi.linkGoogle(idToken);
      Alert.alert("Erfolg", "Google-Konto verknüpft.");
      await onLinked();
    } catch (e) {
      Alert.alert("Google", apiErrorMessage(e, "Verknüpfen fehlgeschlagen."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card elevation={1}>
      <View className="flex-row items-start gap-2 mb-3">
        <ShieldCheck size={16} color="#2563EB" style={{ marginTop: 2 }} />
        <Text className="flex-1 text-[12px] text-gray-600">
          Verbinde dein Google-Konto, damit du dich künftig auch mit Google
          anmelden kannst. Deine E-Mail muss übereinstimmen.
        </Text>
      </View>
      <Button
        title={busy ? "Verknüpfen…" : "Mit Google verknüpfen"}
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
  const [busy, setBusy] = useState(false);

  const handleUnlink = () => {
    Alert.alert(
      "Verknüpfung entfernen",
      "Google-Verknüpfung wirklich entfernen? Du kannst dich danach nur noch mit E-Mail + Passwort anmelden.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Entfernen",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await authApi.unlinkGoogle();
              Alert.alert("Erfolg", "Google-Verknüpfung entfernt.");
              await onUnlinked();
            } catch (e) {
              Alert.alert("Fehler", apiErrorMessage(e, "Entfernen fehlgeschlagen."));
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
          Du kannst dich aktuell mit Google + Passwort anmelden. Nach dem
          Entfernen funktioniert nur noch das Passwort.
        </Text>
      </View>
      <Button
        title={busy ? "Entfernen…" : "Google-Verknüpfung entfernen"}
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
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSet = async () => {
    if (newPwd.length < 8) {
      Alert.alert("Fehler", "Passwort: mindestens 8 Zeichen.");
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Fehler", "Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    try {
      await authApi.setInitialPassword(newPwd);
      await onSet();
    } catch (e) {
      Alert.alert("Fehler", apiErrorMessage(e, "Passwort konnte nicht gesetzt werden."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card elevation={1}>
      <View className="flex-row items-start gap-2 mb-3">
        <LockIcon size={16} color="#2563EB" style={{ marginTop: 2 }} />
        <Text className="flex-1 text-[12px] text-gray-600">
          Setze ein Passwort, damit du dich auch ohne Google anmelden kannst.
          Alle aktiven Sitzungen werden nach dem Speichern beendet.
        </Text>
      </View>
      <Input
        label="Neues Passwort"
        value={newPwd}
        onChangeText={setNewPwd}
        secureTextEntry
        placeholder="Mindestens 8 Zeichen"
      />
      <View style={{ marginTop: 8 }}>
        <PasswordMeter value={newPwd} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Input
          label="Passwort bestätigen"
          value={confirmPwd}
          onChangeText={setConfirmPwd}
          secureTextEntry
          />
      </View>
      <View style={{ marginTop: 16 }}>
        <Button
          title={busy ? "Speichern…" : "Passwort setzen"}
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

function GoogleGlyph() {
  return (
    <View style={{ width: 18, height: 18 }}>
      <Svg width={18} height={18} viewBox="0 0 48 48">
        <Path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <Path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
        />
        <Path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
        />
        <Path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.4 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </Svg>
    </View>
  );
}
