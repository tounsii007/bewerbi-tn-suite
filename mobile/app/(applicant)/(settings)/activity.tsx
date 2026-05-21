import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  KeyRound,
  RefreshCw,
  History,
} from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Path } from "react-native-svg";
import { authApi, IS_API_MODE, type LoginAttemptEntry } from "../../../src/lib/apiClient";
import { apiErrorMessage } from "../../../src/lib/apiError";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GradientText } from "../../../src/components/ui/GradientText";
import { Card } from "../../../src/components/ui/Card";

/**
 * Iter 168 — "Letzte Aktivität" screen for the mobile settings tab.
 *
 * Consumes the GET /api/v1/auth/me/activity endpoint that Iter 161
 * exposed for the web. Shows the last 20 login attempts (success +
 * failure) so the user can spot sign-ins they didn't make and react
 * (force password reset / revoke sessions / unlink Google).
 *
 * Mock-mode builds render an empty state (the endpoint requires a
 * real Spring backend).
 */
export default function ActivityScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [items, setItems] = useState<LoginAttemptEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!IS_API_MODE) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await authApi.activity(20);
      setItems(data);
    } catch (e) {
      setError(apiErrorMessage(e, "Aktivität konnte nicht geladen werden."));
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchActivity();
  }, [fetchActivity]);

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Animated.View entering={FadeIn.springify()} className="px-5 pt-6 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 -ml-2 p-2"
              accessibilityLabel="Zurück"
            >
              <ArrowLeft size={22} color={isDark ? "#e2e8f0" : "#0f172a"} />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-start gap-3">
            <LinearGradient
              colors={["#f59e0b", "#dc2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#dc2626",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <History size={24} color="white" />
            </LinearGradient>
            <View className="flex-1">
              <GradientText
                variant="brand"
                style={{ fontSize: 22, fontWeight: "800", lineHeight: 26 }}
              >
                Letzte Aktivität
              </GradientText>
              <Text
                className={`text-[13px] mt-1 ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                Die letzten 20 Anmeldeversuche. Etwas Verdächtiges?
                Passwort ändern und Sitzungen beenden.
              </Text>
            </View>
          </View>
        </Animated.View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingTop: 4 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#cbd5e1" : "#374151"}
              />
            }
            ListEmptyComponent={
              <View className="items-center mt-12 px-6">
                <Text
                  className={`text-[14px] text-center ${
                    isDark ? "text-dark-muted" : "text-gray-500"
                  }`}
                >
                  {error ?? "Noch keine Anmeldeversuche."}
                </Text>
                {error && (
                  <TouchableOpacity
                    onPress={onRefresh}
                    className="mt-3 flex-row items-center gap-2"
                  >
                    <RefreshCw size={14} color="#2563EB" />
                    <Text className="text-primary-500 text-[13px] font-semibold">
                      Erneut versuchen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item }) => <ActivityRow entry={item} isDark={isDark} />}
          />
        )}
      </SafeAreaView>
    </AuroraBackground>
  );
}

function ActivityRow({
  entry,
  isDark,
}: {
  entry: LoginAttemptEntry;
  isDark: boolean;
}) {
  const when = new Date(entry.occurredAt);
  const whenLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(when);

  const methodIcon =
    entry.method === "GOOGLE" ? (
      <GoogleGlyph />
    ) : entry.method === "REFRESH" ? (
      <RefreshCw size={16} color={isDark ? "#94a3b8" : "#6b7280"} />
    ) : (
      <KeyRound size={16} color={isDark ? "#94a3b8" : "#6b7280"} />
    );

  const methodLabel =
    entry.method === "PASSWORD"
      ? "Passwort"
      : entry.method === "GOOGLE"
        ? "Google"
        : "Token-Refresh";

  return (
    <Card className="mb-2" elevation={1}>
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5">{methodIcon}</View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text
              className={`text-[14px] font-bold ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {whenLabel}
            </Text>
            {entry.success ? (
              <View className="flex-row items-center gap-1 bg-emerald-50 rounded-full px-2 py-0.5">
                <Check size={11} color="#059669" />
                <Text className="text-emerald-700 text-[11px] font-semibold">
                  Erfolgreich
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1 bg-rose-50 rounded-full px-2 py-0.5">
                <AlertTriangle size={11} color="#dc2626" />
                <Text className="text-rose-700 text-[11px] font-semibold">
                  Fehlgeschlagen
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-3 mt-1 flex-wrap">
            <Text
              className={`text-[12px] ${
                isDark ? "text-dark-muted" : "text-gray-500"
              }`}
            >
              {methodLabel}
            </Text>
            {entry.ip && (
              <Text
                className={`text-[12px] ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                IP: {entry.ip}
              </Text>
            )}
            {entry.failureReason && (
              <Text className="text-[12px] text-rose-600 font-medium">
                {humanReason(entry.failureReason)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

/** Stable failure-reason codes → human labels. Mirrors the web
 *  `error.auth.activity.<code>` i18n block from Iter 161; mobile uses
 *  inline strings since the i18n setup here is less mature. */
function humanReason(code: string): string {
  switch (code) {
    case "RATE_LIMITED_ACCOUNT":
      return "Konto kurzzeitig gesperrt";
    case "RATE_LIMITED_IP":
      return "IP kurzzeitig gesperrt";
    case "USER_NOT_FOUND":
      return "Unbekanntes Konto";
    case "INVALID_PASSWORD":
      return "Falsches Passwort";
    case "OAUTH_ACCOUNT_USE_GOOGLE":
      return "Bitte mit Google anmelden";
    case "OAUTH_EMAIL_COLLISION_PASSWORD_USER":
      return "Konto bereits mit Passwort registriert";
    case "OAUTH_TOKEN_MISSING":
      return "Google-Token fehlt";
    case "OAUTH_TOKEN_MALFORMED":
    case "OAUTH_TOKEN_INVALID":
      return "Google-Token ungültig";
    case "OAUTH_AUDIENCE_MISMATCH":
      return "Google-Token für andere App";
    case "OAUTH_EMAIL_UNVERIFIED":
      return "Google-E-Mail nicht verifiziert";
    case "OAUTH_CLAIMS_INCOMPLETE":
      return "Google-Token unvollständig";
    default:
      return code;
  }
}

function GoogleGlyph() {
  return (
    <View style={{ width: 16, height: 16 }}>
      <Svg width={16} height={16} viewBox="0 0 48 48">
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
