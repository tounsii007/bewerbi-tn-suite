import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { useEffect } from "react";
import { motion, palette } from "../../lib/tokens";

interface SwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  /** Override the track colour when on (defaults to primary-500). */
  activeColor?: string;
}

/**
 * iOS-style toggle. Animated track colour + knob translate. Use for binary settings; for
 * mutually-exclusive options reach for [SegmentedControl] instead.
 */
export function Switch({
  value,
  onValueChange,
  disabled = false,
  activeColor = palette.primary[500],
}: SwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, motion.press);
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#cbd5e1", activeColor],
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={[
          trackStyle,
          { width: 48, height: 28, borderRadius: 14, justifyContent: "center" },
        ]}
      >
        <Animated.View
          style={[
            knobStyle,
            {
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              marginLeft: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.18,
              shadowRadius: 2,
              elevation: 2,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
