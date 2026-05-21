import { useRouter, Stack } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Compass, Search } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuroraBackground } from "../src/components/ui/AuroraBackground";
import { GlassCard } from "../src/components/ui/GlassCard";
import { GradientText } from "../src/components/ui/GradientText";
import { ShimmerButton } from "../src/components/ui/ShimmerButton";
import { useThemeStore } from "../src/hooks/useColorScheme";

/**
 * Iter 155 — Expo Router catch-all for unknown deep-links / typos.
 *
 * The `+not-found.tsx` filename is the Expo Router convention for the
 * 404 fallback. We keep the brand language (aurora + glass + gradient
 * text) so a user who hit a stale link still feels "in the app".
 */
export default function NotFoundScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();

  return (
    <>
      <Stack.Screen options={{ title: "404", headerShown: false }} />
      <AuroraBackground variant="vivid" style={{ flex: 1, borderRadius: 0 }}>
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <GlassCard
              strength="strong"
              glow
              style={{ padding: 28, alignItems: "center" }}
            >
              <LinearGradient
                colors={["#2563EB", "#6d4cf7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <Compass size={32} color="white" />
              </LinearGradient>

              <Text
                className={`text-[28px] font-extrabold text-center mt-5 ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                Hier endet die{" "}
                <GradientText
                  variant="brand"
                  style={{ fontSize: 28, fontWeight: "800" }}
                >
                  Karte
                </GradientText>
              </Text>

              <Text
                className={`text-[14px] text-center mt-3 leading-5 ${
                  isDark ? "text-dark-muted" : "text-gray-600"
                }`}
              >
                Die gesuchte Seite existiert nicht — vielleicht wurde sie
                verschoben oder der Link ist veraltet.
              </Text>

              <View className="mt-6 w-full">
                <ShimmerButton
                  onPress={() => router.replace("/(applicant)/(home)")}
                  size="lg"
                  style={{ width: "100%" }}
                >
                  <View className="flex-row items-center gap-2">
                    <Compass size={16} color="white" />
                    <Text className="text-white font-bold text-[15px]">
                      Zur Startseite
                    </Text>
                  </View>
                </ShimmerButton>
              </View>

              <View className="mt-3 w-full">
                <ShimmerButton
                  onPress={() => router.replace("/(applicant)/(search)")}
                  size="lg"
                  static
                  style={{ width: "100%", opacity: 0.85 }}
                >
                  <View className="flex-row items-center gap-2">
                    <Search size={16} color="white" />
                    <Text className="text-white font-bold text-[15px]">
                      Stellen suchen
                    </Text>
                  </View>
                </ShimmerButton>
              </View>
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </AuroraBackground>
    </>
  );
}
