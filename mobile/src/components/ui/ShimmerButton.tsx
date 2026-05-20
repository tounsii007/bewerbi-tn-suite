import React, { useEffect } from "react";
import {
  Pressable,
  Text,
  View,
  type ViewStyle,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { GRADIENT_PILL_DARK } from "../../lib/tokens";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Iter 125 — premium "shimmer" CTA for mobile.
 *
 * Inner pill is a dark linear gradient with the label; outer ring is an
 * animated rainbow LinearGradient that subtly shifts colour stops over
 * time (since RN can't natively do conic gradients, we rotate the
 * gradient's `start`/`end` instead).
 *
 *   <ShimmerButton onPress={...}>Loslegen</ShimmerButton>
 */
type Size = "md" | "lg" | "xl";

interface ShimmerButtonProps {
  size?: Size;
  onPress?: () => void;
  /** Pause the rotating gradient (use for prefers-reduced-motion users). */
  static?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const sizeConfig: Record<
  Size,
  { height: number; paddingHorizontal: number; fontSize: number }
> = {
  md: { height: 44, paddingHorizontal: 20, fontSize: 14 },
  lg: { height: 52, paddingHorizontal: 28, fontSize: 15 },
  xl: { height: 60, paddingHorizontal: 36, fontSize: 16 },
};

const RAINBOW = [
  "#60a5fa",
  "#DC2626",
  "#f59e0b",
  "#16a34a",
  "#60a5fa",
] as const;

export function ShimmerButton({
  size = "lg",
  onPress,
  static: isStatic = false,
  style,
  textStyle,
  children,
  disabled = false,
  accessibilityLabel,
}: ShimmerButtonProps) {
  const cfg = sizeConfig[size];
  const reduceMotion = useReducedMotion();
  const shouldAnimate = !isStatic && !reduceMotion;
  const t = useSharedValue(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    t.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [shouldAnimate, t]);

  // Rotate gradient direction over time so the rainbow appears to spin
  // around the pill.
  const animatedStyle = useAnimatedStyle(() => {
    const angle = interpolate(t.value, [0, 1], [0, Math.PI * 2]);
    return {
      // Slight scale pulse hooked to the same timer
      transform: [{ rotate: `${(angle * 180) / Math.PI}deg` }],
    };
  });

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          height: cfg.height,
          paddingHorizontal: cfg.paddingHorizontal,
          borderRadius: cfg.height / 2,
          overflow: "hidden",
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {/* Animated rainbow ring — sits behind the inner pill */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            // Make the ring oversized + rotate so we see continuous colour
            top: -cfg.height,
            left: -cfg.height,
            right: -cfg.height,
            bottom: -cfg.height,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[...RAINBOW]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: cfg.height * 3 }}
        />
      </Animated.View>

      {/* Inner pill — masks the rainbow with a 1.5px border gap */}
      <View
        style={{
          position: "absolute",
          top: 1.5,
          left: 1.5,
          right: 1.5,
          bottom: 1.5,
          borderRadius: cfg.height / 2,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[...GRADIENT_PILL_DARK]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      {/* Label */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {typeof children === "string" ? (
          <Text
            style={[
              {
                color: "white",
                fontSize: cfg.fontSize,
                fontWeight: "700",
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}
