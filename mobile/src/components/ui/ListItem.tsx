import { View, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { FeedbackPressable } from "./Pressable";
import { useThemeStore } from "../../hooks/useColorScheme";

interface ListItemProps {
  title: string;
  subtitle?: string;
  /** Leading visual — icon, avatar, or any node. */
  leading?: React.ReactNode;
  /** Trailing visual — defaults to a chevron when {@code onPress} is set. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Render a thin divider below this row. */
  divider?: boolean;
  /** Marks the row as destructive (red title, no chevron tint). */
  destructive?: boolean;
}

/**
 * The single most common row pattern in settings, profile, and overview screens. Keeps
 * spacing, divider, and trailing chevron consistent across the app.
 */
export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  divider = false,
  destructive = false,
}: ListItemProps) {
  const { isDark } = useThemeStore();
  const titleColor = destructive
    ? "text-accent-500"
    : isDark
      ? "text-dark-text"
      : "text-gray-900";

  const row = (
    <View className="flex-row items-center px-5 py-3.5">
      {leading && (
        <View className="mr-3 flex-row items-center justify-center">{leading}</View>
      )}
      <View className="flex-1">
        <Text className={`text-[15px] font-semibold ${titleColor}`}>{title}</Text>
        {subtitle && (
          <Text
            className={`mt-0.5 text-[12.5px] ${
              isDark ? "text-dark-muted" : "text-gray-500"
            }`}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ??
        (onPress ? (
          <ChevronRight size={18} color={isDark ? "#64748b" : "#94a3b8"} />
        ) : null)}
    </View>
  );

  return (
    <View>
      {onPress ? (
        <FeedbackPressable
          onPress={onPress}
          scaleTo={0.99}
          opacityTo={0.9}
        >
          {row}
        </FeedbackPressable>
      ) : (
        row
      )}
      {divider && (
        <View
          className={`ml-5 h-px ${isDark ? "bg-dark-border" : "bg-gray-100"}`}
        />
      )}
    </View>
  );
}
