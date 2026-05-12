import { View, TextInput, Text } from "react-native";
import { useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon?: React.ReactNode;
  className?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  multiline,
  numberOfLines = 1,
  keyboardType = "default",
  autoCapitalize = "sentences",
  icon,
  className = "",
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const { isDark } = useThemeStore();
  const borderColor = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      borderColor.value === 1 ? "#2563EB" : error ? "#DC2626" : isDark ? "#334155" : "#e5e7eb",
      { duration: 200 }
    ),
  }));

  return (
    <View className={`mb-5 ${className}`}>
      {label ? (
        <Text className={`text-[13px] font-semibold mb-2 ${isDark ? "text-dark-text" : "text-gray-700"}`}>
          {label}
        </Text>
      ) : null}
      <Animated.View
        style={animatedBorderStyle}
        className={`flex-row items-center rounded-xl border-[1.5px] px-4 ${isDark ? "bg-dark-card" : "bg-gray-50"} ${multiline ? "items-start" : ""} ${focused ? (isDark ? "bg-dark-bg" : "bg-white") : ""}`}
      >
        {icon && <View className="mr-3 opacity-50">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#475569" : "#9ca3af"}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => { setFocused(true); borderColor.value = 1; }}
          onBlur={() => { setFocused(false); borderColor.value = 0; }}
          className={`flex-1 py-3.5 text-[15px] ${isDark ? "text-dark-text" : "text-gray-900"} ${multiline ? "min-h-[120px]" : ""}`}
          style={{ textAlignVertical: multiline ? "top" : "center" }}
        />
      </Animated.View>
      {error && <Text className="text-red-500 text-xs mt-1.5 ml-1">{error}</Text>}
    </View>
  );
}
