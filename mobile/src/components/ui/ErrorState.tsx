import { View, Text } from "react-native";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Button } from "./Button";
import { useThemeStore } from "../../hooks/useColorScheme";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Inline error panel. Use for query failures; pair with a screen-level error boundary for
 * runtime crashes. Keeps the messaging friendly and offers a clear retry path.
 */
export function ErrorState({
  title = "Etwas ist schiefgegangen",
  description = "Bitte versuche es in einem Moment erneut.",
  onRetry,
  retryLabel = "Erneut versuchen",
}: ErrorStateProps) {
  const { isDark } = useThemeStore();
  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      className={`items-center py-10 px-6 rounded-3xl ${
        isDark ? "bg-accent-500/10 border border-accent-500/30" : "bg-accent-50 border border-accent-100"
      }`}
    >
      <View
        className={`rounded-full mb-4 items-center justify-center h-14 w-14 ${
          isDark ? "bg-accent-500/20" : "bg-accent-100"
        }`}
      >
        <AlertTriangle color={isDark ? "#fca5a5" : "#b91c1c"} size={26} />
      </View>
      <Text className={`font-bold text-lg text-center ${isDark ? "text-accent-300" : "text-accent-700"}`}>
        {title}
      </Text>
      <Text
        className={`text-center mt-2 text-sm ${isDark ? "text-accent-200" : "text-accent-700"}`}
        style={{ maxWidth: 320 }}
      >
        {description}
      </Text>
      {onRetry && (
        <View className="mt-5">
          <Button
            title={retryLabel}
            onPress={onRetry}
            variant="outline"
            icon={<RefreshCw color="#2563EB" size={16} />}
          />
        </View>
      )}
    </Animated.View>
  );
}
