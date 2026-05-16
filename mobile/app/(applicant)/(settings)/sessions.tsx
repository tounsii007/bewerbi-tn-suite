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
import { useThemeStore } from "../../../src/hooks/useColorScheme";

type Session = {
  tokenHash: string;
  createdAt: number;
  lastUsedAt: number;
  userAgent: string;
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
  const [items, setItems] = useState<Session[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={20} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}
        >
          Aktive Sitzungen
        </Text>
      </View>

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
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn}>
              <View
                className={`flex-row items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                  isDark ? "border-dark-border bg-dark-card" : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  {deviceIcon(item.userAgent, isDark ? "#94a3b8" : "#6b7280")}
                  <View className="flex-1">
                    <Text
                      className={`text-[15px] font-semibold ${isDark ? "text-dark-text" : "text-gray-900"}`}
                      numberOfLines={1}
                    >
                      {deviceLabel(item.userAgent)}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${isDark ? "text-dark-muted" : "text-gray-500"}`}
                    >
                      Zuletzt aktiv {formatCreatedAt(item.lastUsedAt || item.createdAt)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => revoke(item)}
                  className="p-2 rounded-full"
                >
                  <X size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
