import { View, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

/**
 * Polite "nothing here yet" panel. Mirrors the web {@code EmptyState} so screens feel the same
 * across platforms. The icon sits in a circle that adapts to dark mode.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  const { isDark } = useThemeStore();
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18)}
      className={`items-center ${compact ? "py-6" : "py-12"} px-6`}
    >
      {icon && (
        <View
          className={`rounded-full mb-4 items-center justify-center ${
            compact ? "h-12 w-12" : "h-16 w-16"
          } ${isDark ? "bg-dark-card border border-dark-border" : "bg-white"}`}
          style={{
            shadowColor: "#000",
            shadowOpacity: isDark ? 0 : 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: isDark ? 0 : 2,
          }}
        >
          {icon}
        </View>
      )}
      <Text
        className={`font-bold text-center ${
          compact ? "text-base" : "text-lg"
        } ${isDark ? "text-dark-text" : "text-gray-900"}`}
      >
        {title}
      </Text>
      {description && (
        <Text
          className={`text-center mt-2 ${
            isDark ? "text-dark-muted" : "text-gray-500"
          } ${compact ? "text-xs" : "text-sm"}`}
          style={{ maxWidth: 320 }}
        >
          {description}
        </Text>
      )}
      {action && <View className="mt-5">{action}</View>}
    </Animated.View>
  );
}
