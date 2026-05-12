import { Pressable, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { useThemeStore } from "../../hooks/useColorScheme";
import { motion } from "../../lib/tokens";

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Renders a smaller variant for table-row use. */
  size?: "sm" | "md";
}

/**
 * Material-style checkbox with an inset checkmark on activation. The check animates in via a
 * scale-spring rather than a binary swap — small detail that reads as polish.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
}: CheckboxProps) {
  const { isDark } = useThemeStore();
  const scale = useSharedValue(checked ? 1 : 0);
  const dim = size === "sm" ? 18 : 22;
  const iconSize = size === "sm" ? 12 : 14;

  useEffect(() => {
    scale.value = withTiming(checked ? 1 : 0, { duration: motion.fast });
  }, [checked, scale]);

  const checkAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View className="flex-row items-center gap-2">
        <View
          style={{
            width: dim,
            height: dim,
            borderRadius: 6,
            borderWidth: 1.5,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: checked
              ? "#2563EB"
              : isDark
                ? "transparent"
                : "#ffffff",
            borderColor: checked
              ? "#2563EB"
              : isDark
                ? "#475569"
                : "#cbd5e1",
          }}
        >
          <Animated.View style={checkAnim}>
            <Check size={iconSize} color="#ffffff" strokeWidth={3} />
          </Animated.View>
        </View>
        {label && (
          <Text
            className={`text-[14px] ${
              isDark ? "text-dark-text" : "text-gray-700"
            }`}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
