import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";

/**
 * Iter 125 — flex-based Bento layout for mobile.
 *
 * React Native Flexbox doesn't do CSS Grid, but we can fake an asymmetric
 * bento by giving cells a `flex` weight (think: column-span) and grouping
 * them into rows. The {@link BentoRow} component is just a flex container;
 * callers compose rows to create the desired layout.
 *
 *   <BentoGrid gap={12}>
 *     <BentoRow>
 *       <BentoCell flex={2}>hero</BentoCell>
 *       <BentoCell flex={1}>side</BentoCell>
 *     </BentoRow>
 *     <BentoRow>
 *       <BentoCell flex={1}>a</BentoCell>
 *       <BentoCell flex={1}>b</BentoCell>
 *       <BentoCell flex={1}>c</BentoCell>
 *     </BentoRow>
 *   </BentoGrid>
 */
interface BentoGridProps {
  gap?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function BentoGrid({ gap = 12, style, children }: BentoGridProps) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

interface BentoRowProps {
  gap?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function BentoRow({ gap = 12, style, children }: BentoRowProps) {
  return (
    <View style={[{ flexDirection: "row", gap }, style]}>{children}</View>
  );
}

interface BentoCellProps {
  /** Flex weight for the cell (default 1). Treat as column-span analog. */
  flex?: number;
  /** Minimum height for the cell — keeps short cells from collapsing. */
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function BentoCell({
  flex = 1,
  minHeight = 120,
  style,
  children,
}: BentoCellProps) {
  return <View style={[{ flex, minHeight }, style]}>{children}</View>;
}
