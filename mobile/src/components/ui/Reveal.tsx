import React from "react";
import type { ViewStyle, StyleProp } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
} from "react-native-reanimated";

/**
 * Iter 125 — mobile equivalent of the web Reveal component.
 *
 * Uses reanimated's `FadeIn*` entering animations under the hood. Plays
 * once when the component mounts (mobile screens typically mount on
 * navigation, so this matches the web "once on scroll-into-view" feel).
 *
 *   <Reveal direction="up" delay={120}>
 *     <Text>...</Text>
 *   </Reveal>
 */
type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  direction?: Direction;
  /** Delay in milliseconds. */
  delay?: number;
  /** Duration in milliseconds (default 600). */
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Reveal({
  direction = "up",
  delay = 0,
  duration = 600,
  style,
  children,
}: RevealProps) {
  const enter = (() => {
    switch (direction) {
      case "up":
        return FadeInUp;
      case "down":
        return FadeInDown;
      case "left":
        return FadeInLeft;
      case "right":
        return FadeInRight;
      case "none":
      default:
        return FadeIn;
    }
  })().delay(delay).duration(duration);

  return (
    <Animated.View entering={enter} style={style}>
      {children}
    </Animated.View>
  );
}
