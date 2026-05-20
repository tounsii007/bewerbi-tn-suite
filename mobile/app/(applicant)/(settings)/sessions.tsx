import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Smartphone, Monitor, Globe, X } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi, IS_API_MODE } from "../../../src/lib/apiClient";
import { apiErrorMessage } from "../../../src/lib/apiError";
import { sha256Hex } from "../../../src/lib/sha256";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import { AuroraBackground } from "../../../src/components/ui/AuroraBackground";
import { GradientText } from "../../../src/components/ui/GradientText";

type Session = {
  tokenHash: string;
  createdAt: number;
  lastUsedAt: number;
  userAgent: string;
  ip: string;
  expiresInSeconds: number;
};

function deviceIcon(ua: string, color: string) {
  const lc = ua.toLowerCase();
  if (lc.includes("android") || lc.includes("iphone") || lc.includes("mobile")) {
    return <Smartphone size={20} color={color} />;
  }
  if (lc.includes("windows") || lc.includes("mac") || lc.includes("linux")) {
    return <Monitor size={20} color={color} />;
  }
  return <Globe size={20} color={color} />;
}

function deviceLabel(ua: string): string {
  if (!ua) return "Unbekanntes Gerät";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "App";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iOS/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} · ${os}` : browser;
}

function formatCreatedAt(epochSec: number): string {
  if (!epochSec) return "—";
  return new Date(epochSec * 1000).toLocaleString();
}

export default function SessionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const tokens = useAuthStore((s) => s.tokens);
  const [items, setItems] = useState<Session[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentHash, setCurrentHash] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const rt = tokens?.refreshToken;
    if (!rt) {
      setCurrentHash(null);
      return;
    }
    void sha256Hex(rt).then((h) => {
      if (alive) setCurrentHash(h);
    });
    return () => {
      alive = false;
    };
  }, [tokens?.refreshToken]);

  const fetchSessions = useCallback(async () => {
    if (!IS_API_MODE) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const list = await authApi.sessions();
      setItems(list);
    } catch (e) {
      Alert.alert(t("common.error"), apiErrorMessage(e, "Konnte Sitzungen nicht laden."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const revoke = (s: Session) => {
    Alert.alert(
      "Sitzung beenden",
      `${deviceLabel(s.userAgent)} wird abgemeldet.`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Beenden",
          style: "destructive",
          onPress: async () => {
            try {
              await authApi.revokeSession(s.tokenHash);
              setItems((curr) => curr?.filter((x) => x.tokenHash !== s.tokenHash) ?? null);
            } catch (e) {
              Alert.alert(t("common.error"), apiErrorMessage(e, "Beenden fehlgeschlagen."));
            }
          },
        },
      ],
    );
  };

  const revokeOthers = () => {
    Alert.alert(
      "Auf allen anderen Geräten abmelden",
      "Diese Sitzung bleibt aktiv, alle anderen werden beendet.",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Beenden",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await authApi.revokeOtherSessions(currentHash ?? undefined);
              setItems((curr) =>
                curr ? curr.filter((x) => x.tokenHash === currentHash) : curr,
              );
              Alert.alert(
                t("common.success") ?? "OK",
                result.revoked === 1
                  ? "1 andere Sitzung beendet."
                  : `${result.revoked} andere Sitzungen beendet.`,
              );
            } catch (e) {
              Alert.alert(t("common.error"), apiErrorMessage(e, "Beenden fehlgeschlagen."));
            }
          },
        },
      ],
    );
  };

  const otherCount = currentHash
    ? (items ?? []).filter((s) => s.tokenHash !== currentHash).length
    : (items ?? []).length;

  return (
    <AuroraBackground variant="subtle" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Animated.View entering={FadeIn} className="px-5 pt-4 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-4 self-start"
          >
            <ArrowLeft size={16} color="#2563EB" />
            <Text className="text-primary-500 text-[14px] font-semibold">
              {t("common.back")}
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-start gap-3">
            <LinearGradient
              colors={["#06b6d4", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#06b6d4",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Smartphone size={22} color="white" />
            </LinearGradient>
            <View className="flex-1">
              <GradientText
                variant="brand"
                style={{ fontSize: 22, fontWeight: "800", lineHeight: 26 }}
              >
                Aktive Sitzungen
              </GradientText>
              <Text
                className={`text-[12px] mt-1 ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                Sieh wo dein Konto eingeloggt ist und beende Sessions.
              </Text>
            </View>
            {otherCount > 0 && (
              <TouchableOpacity
                onPress={revokeOthers}
                className="px-3 py-1.5 rounded-full bg-accent-500/15"
              >
                <Text className="text-[12px] font-bold text-accent-500">Andere beenden</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items ?? []}
          keyExtractor={(s) => s.tokenHash}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchSessions();
              }}
            />
          }
          ListEmptyComponent={
            <Text
              className={`text-center text-sm ${isDark ? "text-dark-muted" : "text-gray-500"}`}
            >
              Keine aktiven Sitzungen.
            </Text>
          }
          renderItem={({ item }) => {
            const isCurrent = currentHash !== null && item.tokenHash === currentHash;
            return (
              <Animated.View entering={FadeIn}>
                <View
                  className={`flex-row items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                    isDark ? "border-dark-border bg-dark-card" : "border-gray-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    {deviceIcon(item.userAgent, isDark ? "#94a3b8" : "#6b7280")}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text
                          className={`text-[15px] font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}
                          numberOfLines={1}
                        >
                          {deviceLabel(item.userAgent)}
                        </Text>
                        {isCurrent && (
                          <View className="rounded-full bg-emerald-100 px-2 py-0.5">
                            <Text className="text-[10px] font-semibold uppercase text-emerald-700">
                              Dieses Gerät
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        className={`text-xs mt-0.5 ${isDark ? "text-dark-muted" : "text-gray-500"}`}
                      >
                        Zuletzt aktiv {formatCreatedAt(item.lastUsedAt || item.createdAt)}
                        {item.ip ? ` · ${item.ip}` : ""}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => revoke(item)}
                    disabled={isCurrent}
                    className="p-2 rounded-full"
                  >
                    <X size={18} color={isCurrent ? "#cbd5e1" : "#dc2626"} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          }}
        />
      )}
      </SafeAreaView>
    </AuroraBackground>
  );
}
