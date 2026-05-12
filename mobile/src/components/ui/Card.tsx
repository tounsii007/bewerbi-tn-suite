import { TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import { shadow } from "../../lib/shadows";

type Elevation = 1 | 2 | 3;

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  index?: number;
  elevation?: Elevation;
}

const elevationToLevel = {
  1: "sm",
  2: "md",
  3: "lg",
} as const;

export function Card({
  children,
  onPress,
  className = "",
  index = 0,
  elevation = 1,
}: CardProps) {
  const { isDark } = useThemeStore();

  const content = (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      className={`rounded-2xl p-5 ${
        isDark ? "bg-dark-card border border-dark-border" : "bg-white"
      } ${className}`}
      style={isDark ? undefined : shadow(elevationToLevel[elevation])}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.65}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
