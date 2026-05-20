import React from "react";
import {
  View,
  Pressable,
  type ViewStyle,
  type StyleProp,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useThemeStore } from "../../hooks/useColorScheme";
import { shadow } from "../../lib/shadows";

/**
 * Iter 125 — frosted glass card primitive for mobile.
 *
 * Wraps `expo-blur`'s BlurView with a tinted overlay so the surface
 * stays readable on bright or dark backgrounds. On web (expo-router web),
 * `expo-blur` falls back to a translucent background colour.
 *
 * Strength variants mirror the web GlassCard:
 *   - subtle: light frost, secondary surfaces
 *   - default: balanced (most common)
 *   - strong: nav, command palette
 *   - frosted: modals / drawers
 *
 * Pass `onPress` to make it tappable with the standard activeOpacity
 * dampen we use across the app.
 */
type Strength = "subtle" | "default" | "strong" | "frosted";

interface GlassCardProps {
  strength?: Strength;
  /** Apply a brand-coloured halo around the card. */
  glow?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  children: React.ReactNode;
}

const intensityFor: Record<Strength, number> = {
  subtle: 12,
  default: 24,
  strong: 50,
  frosted: 80,
};

export function GlassCard({
  strength = "default",
  glow = false,
  onPress,
  style,
  className = "",
  children,
}: GlassCardProps) {
  const { isDark } = useThemeStore();

  // On Android the blur intensity caps at ~25 — the tinted overlay
  // (below) does most of the work there.
  const intensity =
    Platform.OS === "android" ? Math.min(intensityFor[strength], 25) : intensityFor[strength];

  const tint = isDark ? "dark" : "light";
  const overlayColor = isDark
    ? `rgba(15, 23, 42, ${strength === "subtle" ? 0.35 : strength === "default" ? 0.55 : 0.7})`
    : `rgba(255, 255, 255, ${strength === "subtle" ? 0.45 : strength === "default" ? 0.65 : 0.8})`;

  const borderColor = isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(255, 255, 255, 0.5)";

  const containerStyle: StyleProp<ViewStyle> = [
    {
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor,
    },
    glow && {
      shadowColor: "#2563EB",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
    },
    !glow && shadow("md"),
    style,
  ];

  const inner = (
    <View style={containerStyle} className={className}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={{ position: "absolute", inset: 0 }}
      />
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: overlayColor,
        }}
      />
      <View>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        // Subtle dampen + scale on press for tactility
        style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}
