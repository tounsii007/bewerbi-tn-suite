import { View, Text, TouchableOpacity } from "react-native";
import type { ComponentType } from "react";
import {
  Monitor,
  HeartPulse,
  Truck,
  GraduationCap,
  BookOpen,
  Briefcase,
} from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import { shadow } from "../../lib/shadows";

interface CategoryCardProps {
  title: string;
  icon: string;
  color: string;
  count?: number;
  onPress: () => void;
  index?: number;
}

const iconMap: Record<string, ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  monitor: Monitor,
  "heart-pulse": HeartPulse,
  truck: Truck,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  briefcase: Briefcase,
};

export function CategoryCard({
  title,
  icon,
  color,
  onPress,
  index = 0,
}: CategoryCardProps) {
  const { isDark } = useThemeStore();
  const IconComponent = iconMap[icon] || Briefcase;

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.65}
        className={`rounded-2xl p-3 items-center justify-center w-[88px] h-[100px] ${
          isDark ? "bg-dark-card border border-dark-border" : "bg-white"
        }`}
        style={isDark ? undefined : shadow("sm")}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mb-2.5"
          style={{ backgroundColor: color + "14" }}
        >
          <IconComponent size={24} color={color} strokeWidth={1.8} />
        </View>
        <Text
          className={`text-xs font-semibold text-center leading-[14px] ${isDark ? "text-dark-text" : "text-gray-700"}`}
          numberOfLines={2}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
