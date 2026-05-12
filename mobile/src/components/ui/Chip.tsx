import { Pressable, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";
import { useThemeStore } from "../../hooks/useColorScheme";

type ChipTone = "neutral" | "primary" | "success" | "warning" | "accent";

interface ChipProps {
  label: string;
  /** Marks the chip as active/selected. Adds a tick and primary tinting. */
  selected?: boolean;
  /** When set, makes the chip a press target. */
  onPress?: () => void;
  /** When set, renders a trailing X handler — for filter pill removal. */
  onRemove?: () => void;
  tone?: ChipTone;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Compact label. Two roles, picked via props:
 * - read-only badge (no {@code onPress}, no {@code onRemove})
 * - filter chip (with {@code onPress}; tap to toggle {@code selected})
 *
 * The tone palette stays small on purpose; for richer status pills use {@code Badge}.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  tone = "neutral",
  icon,
  className = "",
}: ChipProps) {
  const { isDark } = useThemeStore();

  const tones: Record<ChipTone, { bg: string; bgDark: string; fg: string; fgDark: string }> = {
    neutral: {
      bg: "bg-gray-100",
      bgDark: "bg-dark-border",
      fg: "text-gray-700",
      fgDark: "text-dark-text",
    },
    primary: {
      bg: "bg-primary-50",
      bgDark: "bg-primary-500/15",
      fg: "text-primary-700",
      fgDark: "text-primary-300",
    },
    success: {
      bg: "bg-success-100",
      bgDark: "bg-success-500/15",
      fg: "text-success-700",
      fgDark: "text-success-500",
    },
    warning: {
      bg: "bg-warning-100",
      bgDark: "bg-warning-500/15",
      fg: "text-warning-700",
      fgDark: "text-warning-500",
    },
    accent: {
      bg: "bg-accent-50",
      bgDark: "bg-accent-500/15",
      fg: "text-accent-700",
      fgDark: "text-accent-500",
    },
  };

  const t = tones[selected ? "primary" : tone];
  const bg = isDark ? t.bgDark : t.bg;
  const fg = isDark ? t.fgDark : t.fg;

  const content = (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${bg} ${className}`}
    >
      {selected && (
        <Check size={12} color={isDark ? "#93c5fd" : "#1d4ed8"} strokeWidth={3} />
      )}
      {icon && !selected && icon}
      <Text className={`text-[12px] font-semibold ${fg}`}>{label}</Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="ml-1 -mr-1 rounded-full"
          accessibilityLabel={`Entfernen: ${label}`}
        >
          <X size={12} color={isDark ? "#94a3b8" : "#64748b"} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}
