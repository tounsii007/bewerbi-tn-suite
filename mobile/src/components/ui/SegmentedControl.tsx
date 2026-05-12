import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import { motion } from "../../lib/tokens";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

/**
 * iOS-style segmented control that works on Android too. The active pill animates between
 * positions instead of cross-fading, which reads as "selection changed" rather than "this
 * area redrew".
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  const { isDark } = useThemeStore();
  const [width, setWidth] = useState(0);
  const segWidth = width > 0 ? width / options.length : 0;
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(activeIndex * segWidth);

  useEffect(() => {
    x.value = withSpring(activeIndex * segWidth, motion.press);
  }, [activeIndex, segWidth, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: segWidth,
  }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={`flex-row relative rounded-2xl p-1 ${
        isDark ? "bg-dark-bg" : "bg-gray-100"
      } ${className}`}
    >
      {segWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            pillStyle,
            {
              position: "absolute",
              top: 4,
              left: 4,
              bottom: 4,
              borderRadius: 14,
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              shadowColor: "#000",
              shadowOpacity: isDark ? 0 : 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 1 },
              elevation: isDark ? 0 : 1,
            },
          ]}
        />
      )}
      {options.map((o) => {
        const isActive = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            className="flex-1 py-2.5 items-center"
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={`text-[13px] font-semibold ${
                isActive
                  ? isDark
                    ? "text-dark-text"
                    : "text-gray-900"
                  : isDark
                    ? "text-dark-muted"
                    : "text-gray-500"
              }`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
