import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { isDark } = useThemeStore();

  return (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center py-16 px-8">
      <View className="mb-4">{icon}</View>
      <Text className={`text-lg font-semibold text-center mb-2 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className={`text-sm text-center mb-6 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
          {subtitle}
        </Text>
      )}
      {action}
    </Animated.View>
  );
}
