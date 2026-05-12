import { useEffect } from "react";
import { View, Text, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { useAuthStore } from "../src/stores/authStore";

const { width } = Dimensions.get("window");

const heroGradient = Platform.select({
  web: { background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #1e40af 100%)" },
  default: {},
});

export default function SplashScreenPage() {
  const router = useRouter();
  const { session, loading, profile } = useAuthStore();

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const dotScale1 = useSharedValue(0);
  const dotScale2 = useSharedValue(0);
  const dotScale3 = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS !== "web") {
      SplashScreen.hideAsync();
    }

    // Logo animation
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 8 })
    );
    logoOpacity.value = withTiming(1, { duration: 400 });

    // Title
    titleTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    // Subtitle
    subtitleTranslateY.value = withDelay(600, withSpring(0, { damping: 12 }));
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Loading dots
    dotScale1.value = withDelay(800, withTiming(1, { duration: 300 }));
    dotScale2.value = withDelay(1000, withTiming(1, { duration: 300 }));
    dotScale3.value = withDelay(1200, withTiming(1, { duration: 300 }));
  }, []);

  // Navigate after delay using JS timer (reliable on web + native)
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!session) {
        router.replace("/(auth)/login");
      } else if (profile?.role === "employer") {
        router.replace("/(employer)/(dashboard)");
      } else if (profile?.role === "admin") {
        router.replace("/(admin)/users");
      } else {
        router.replace("/(applicant)/(home)");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, session, profile]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleTranslateY.value }],
    opacity: subtitleOpacity.value,
  }));

  const dotStyle = (dotScale: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: dotScale.value }],
      opacity: dotScale.value,
    }));

  return (
    <View className="flex-1 bg-primary-500 items-center justify-center" style={{ flex: 1, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", ...(heroGradient as any) }}>
      {/* Logo */}
      <Animated.View
        style={[logoStyle, Platform.select({ web: { boxShadow: "0 8px 32px rgba(0,0,0,0.2)" } as any, default: {} })]}
        className="w-28 h-28 bg-white rounded-3xl items-center justify-center mb-6"
      >
        <Text className="text-5xl font-bold text-primary-500">B</Text>
        <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-500 rounded-full items-center justify-center">
          <Text className="text-white text-[10px] font-bold">.tn</Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={titleStyle}>
        <Text className="text-3xl font-bold text-white tracking-wider">bewerbi.tn</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={subtitleStyle} className="mt-3 items-center">
        <Text className="text-base text-primary-100">Deine Br&#252;cke nach Deutschland</Text>
        <View className="flex-row items-center gap-2 mt-2">
          <View className="flex-row">
            <View className="w-5 h-3 bg-red-500 rounded-l" />
            <View className="w-5 h-3 bg-white items-center justify-center">
              <View className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            </View>
          </View>
          <Text className="text-white text-sm">&#8594;</Text>
          <View className="flex-row">
            <View className="w-3 h-3 bg-black rounded-l" />
            <View className="w-3 h-3 bg-red-600" />
            <View className="w-3 h-3 bg-yellow-400 rounded-r" />
          </View>
        </View>
      </Animated.View>

      {/* Loading dots */}
      <View className="flex-row gap-2.5 mt-14">
        {[dotScale1, dotScale2, dotScale3].map((dot, i) => (
          <Animated.View
            key={i}
            style={dotStyle(dot)}
            className="w-2.5 h-2.5 bg-white/80 rounded-full"
          />
        ))}
      </View>
    </View>
  );
}
