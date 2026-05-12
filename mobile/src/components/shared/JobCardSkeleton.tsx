import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useThemeStore } from "../../hooks/useColorScheme";
import { shadow } from "../../lib/shadows";

function Shimmer({
  width,
  height,
  rounded = 6,
}: {
  width: number | `${number}%`;
  height: number;
  rounded?: number;
}) {
  const { isDark } = useThemeStore();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: rounded,
          backgroundColor: isDark ? "#334155" : "#e5e7eb",
        },
        animatedStyle,
      ]}
    />
  );
}

export function JobCardSkeleton() {
  const { isDark } = useThemeStore();
  return (
    <View
      className={`rounded-2xl mb-3 overflow-hidden ${
        isDark ? "bg-dark-card border border-dark-border" : "bg-white"
      }`}
      style={isDark ? undefined : shadow("md")}
    >
      <View className={`h-1 ${isDark ? "bg-dark-border" : "bg-gray-200"}`} />
      <View className="p-5">
        <View className="flex-row gap-2 mb-3">
          <Shimmer width={60} height={20} />
          <Shimmer width={80} height={20} />
        </View>
        <Shimmer width="80%" height={18} />
        <View className="h-2" />
        <Shimmer width="50%" height={14} />
        <View className="h-4" />
        <View className="flex-row gap-3">
          <Shimmer width={100} height={14} />
          <Shimmer width={80} height={14} />
        </View>
      </View>
    </View>
  );
}
