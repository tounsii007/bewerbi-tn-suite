import { useEffect } from "react";
import { View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";

/**
 * Animated placeholder block. Pulses opacity at a slow 1.2s cadence — RN doesn't easily get a
 * cross-platform shimmer right, and pulse reads as "loading" without burning the GPU.
 *
 * Use {@link SkeletonGroup} for multi-line text placeholders.
 */
export interface SkeletonProps extends Omit<ViewProps, "children"> {
  className?: string;
  /** Width — number (pixels) or percentage string. */
  width?: number | `${number}%`;
  /** Height — number (pixels). */
  height?: number;
  radius?: number;
}

export function Skeleton({
  className = "",
  width,
  height = 14,
  radius = 8,
  style,
  ...rest
}: SkeletonProps) {
  const { isDark } = useThemeStore();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const animated = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.45, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      accessible={false}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: isDark ? "#334155" : "#e2e8f0",
        },
        style,
        animated,
      ]}
      className={className}
      {...rest}
    />
  );
}

export function SkeletonGroup({
  lines = 3,
  lineHeight = 12,
  gap = 8,
  lastWidth = "62%",
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastWidth?: `${number}%`;
}) {
  return (
    <View>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={{ marginTop: i === 0 ? 0 : gap }}>
          <Skeleton
            height={lineHeight}
            width={i === lines - 1 ? lastWidth : "100%"}
          />
        </View>
      ))}
    </View>
  );
}
