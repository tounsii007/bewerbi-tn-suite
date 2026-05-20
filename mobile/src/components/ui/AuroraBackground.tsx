import React, { useEffect } from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";

/**
 * Iter 125 — animated multi-blob backdrop for mobile heroes.
 *
 * Three radial-ish blobs (LinearGradient circles) drift independently at
 * different rates. The base surface is a soft brand gradient. Wrap a hero
 * screen in <AuroraBackground> to give it the Apple-keynote feel.
 *
 * Variants:
 *   - subtle  (dashboards, dense UI)
 *   - default (auth, marketing)
 *   - vivid   (landing-style heroes)
 *
 * Honours prefers-reduced-motion via the static prop.
 */
type Variant = "subtle" | "default" | "vivid";

interface AuroraBackgroundProps {
  variant?: Variant;
  static?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const opacityFor: Record<Variant, number> = {
  subtle: 0.4,
  default: 0.6,
  vivid: 0.85,
};

export function AuroraBackground({
  variant = "default",
  static: isStatic = false,
  style,
  children,
}: AuroraBackgroundProps) {
  const { isDark } = useThemeStore();
  const op = opacityFor[variant];

  // Two independent drift animations — one slow, one faster, so the
  // composite never visibly loops.
  const t1 = useSharedValue(0);
  const t2 = useSharedValue(0);

  useEffect(() => {
    if (isStatic) return;
    t1.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    t2.value = withRepeat(
      withTiming(1, { duration: 28000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [isStatic, t1, t2]);

  const blobA = useAnimatedStyle(() => ({
    transform: [
      { translateX: t1.value * 40 - 20 },
      { translateY: t1.value * 30 - 15 },
      { scale: 1 + t1.value * 0.08 },
    ],
  }));
  const blobB = useAnimatedStyle(() => ({
    transform: [
      { translateX: -t2.value * 30 + 15 },
      { translateY: t2.value * 40 - 20 },
      { scale: 1 + (1 - t2.value) * 0.06 },
    ],
  }));
  const blobC = useAnimatedStyle(() => ({
    transform: [
      { translateX: t2.value * 20 - 10 },
      { translateY: -t1.value * 30 + 15 },
    ],
  }));

  // Base surface gradient — softer in light mode, darker in dark mode.
  const baseColors = isDark
    ? (["#0f172a", "#1e293b", "#0f172a"] as const)
    : (["#f8fafc", "#eff6ff", "#fef2f2"] as const);

  return (
    <View
      style={[
        { position: "relative", overflow: "hidden", borderRadius: 24 },
        style,
      ]}
    >
      <LinearGradient
        colors={baseColors}
        style={{ position: "absolute", inset: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Three drifting blobs — pointerEvents none so they never block taps */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: -120,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: 360,
            opacity: op,
          },
          blobA,
        ]}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(37, 81, 204, 0.65)" : "rgba(59, 130, 246, 0.65)",
            "transparent",
          ]}
          style={{ flex: 1, borderRadius: 360 }}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 60,
            right: -100,
            width: 320,
            height: 320,
            borderRadius: 320,
            opacity: op,
          },
          blobB,
        ]}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(185, 28, 28, 0.5)" : "rgba(220, 38, 38, 0.55)",
            "transparent",
          ]}
          style={{ flex: 1, borderRadius: 320 }}
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            bottom: -120,
            left: 80,
            width: 380,
            height: 380,
            borderRadius: 380,
            opacity: op,
          },
          blobC,
        ]}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(5, 150, 105, 0.45)" : "rgba(22, 163, 74, 0.45)",
            "transparent",
          ]}
          style={{ flex: 1, borderRadius: 380 }}
        />
      </Animated.View>

      {/* Children sit on top of the blobs */}
      <View>{children}</View>
    </View>
  );
}
