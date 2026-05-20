import React from "react";
import { Text, type TextStyle, type TextProps } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import {
  GRADIENT_BRAND,
  GRADIENT_AURORA,
  GRADIENT_SUNRISE,
  GRADIENT_FLAME,
} from "../../lib/tokens";

/**
 * Iter 125 — gradient text primitive for mobile.
 *
 * Implementation notes: React Native has no native CSS background-clip, so
 * we mask a LinearGradient with the text using `@react-native-masked-view`.
 * That package is pulled transitively by `react-navigation` (already in
 * Expo Router projects) so we don't add a new dependency here.
 *
 * Variants mirror the web `GradientText` exactly so designers can compare
 * the two platforms side-by-side.
 *
 * Usage:
 *   <GradientText variant="brand" style={{ fontSize: 36, fontWeight: '800' }}>
 *     Deutschland
 *   </GradientText>
 */
type Variant = "brand" | "aurora" | "sunrise" | "flame";

const GRADIENTS = {
  brand: GRADIENT_BRAND,
  aurora: GRADIENT_AURORA,
  sunrise: GRADIENT_SUNRISE,
  flame: GRADIENT_FLAME,
} as const;

interface GradientTextProps extends Omit<TextProps, "style"> {
  variant?: Variant;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

export function GradientText({
  variant = "brand",
  style,
  children,
  ...textProps
}: GradientTextProps) {
  const colors = [...GRADIENTS[variant]] as unknown as readonly [
    string,
    string,
    ...string[],
  ];

  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: "transparent" }]} {...textProps}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Invisible duplicate provides the gradient layer with the right
            dimensions; mask shows it only inside the text glyphs. */}
        <Text style={[style, { opacity: 0 }]} {...textProps}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
