import { View, Text } from "react-native";
import { useThemeStore } from "../../hooks/useColorScheme";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
}

/**
 * Page/section header — same shape as the web counterpart. Use one per screen above the
 * primary card stack to give the screen a clear identity.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  trailing,
}: SectionHeaderProps) {
  const { isDark } = useThemeStore();
  return (
    <View className="flex-row items-start justify-between px-5 pt-2 pb-4">
      <View className="flex-1 pr-3">
        {eyebrow && (
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary-500 mb-1">
            {eyebrow}
          </Text>
        )}
        <Text
          className={`text-[22px] font-bold tracking-tight ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
        >
          {title}
        </Text>
        {description && (
          <Text
            className={`text-[13px] mt-1 leading-snug ${
              isDark ? "text-dark-muted" : "text-gray-500"
            }`}
          >
            {description}
          </Text>
        )}
      </View>
      {trailing && <View>{trailing}</View>}
    </View>
  );
}
