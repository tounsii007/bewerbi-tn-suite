import React, { useEffect, useState } from "react";
import { Text, type TextStyle, type StyleProp } from "react-native";
import {
  useSharedValue,
  withSpring,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";

/**
 * Iter 125 — mobile NumberTicker: animated counter with spring physics.
 *
 * On mount the value springs from 0 to `value`. Uses Reanimated worklets
 * so the animation runs on the UI thread (no JS bridge per frame). The
 * formatted display string is computed in a worklet → JS reaction.
 *
 *   <NumberTicker value={1284} suffix="+" />
 *   <NumberTicker value={94} suffix=" %" decimals={0} />
 */
interface NumberTickerProps {
  value: number;
  locale?: string;
  decimals?: number;
  /** Spring stiffness — higher is snappier. Default 60. */
  stiffness?: number;
  /** Spring damping — higher is less oscillation. Default 18. */
  damping?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

export function NumberTicker({
  value,
  locale = "de-DE",
  decimals = 0,
  stiffness = 60,
  damping = 18,
  prefix = "",
  suffix = "",
  style,
}: NumberTickerProps) {
  const animated = useSharedValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    animated.value = withSpring(value, { stiffness, damping, mass: 1 });
  }, [value, stiffness, damping, animated]);

  useAnimatedReaction(
    () => animated.value,
    (current) => {
      const fmt = (n: number) =>
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(n);
      runOnJS(setDisplay)(fmt(current));
    },
    [locale, decimals],
  );

  return (
    <Text style={style} accessibilityLabel={`${prefix}${value}${suffix}`}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}
