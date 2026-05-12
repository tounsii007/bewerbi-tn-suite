import { Pressable, View, Text } from "react-native";
import { useThemeStore } from "../../hooks/useColorScheme";

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  /** Card-like rows with a divider — for settings screens. Default is compact. */
  variant?: "compact" | "card";
}

/**
 * Vertical radio group. Two variants:
 *   - compact: inline icon + label (form sections)
 *   - card:    card-row with description (onboarding / settings)
 *
 * Always renders as a single accessibility "radiogroup". Each row uses the platform's radio
 * gestures via {@code accessibilityRole}.
 */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  variant = "compact",
}: RadioGroupProps<T>) {
  const { isDark } = useThemeStore();

  return (
    <View accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const selected = o.value === value;
        const divider = variant === "card" && i < options.length - 1;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
          >
            <View
              className={
                variant === "card"
                  ? `flex-row items-start gap-3 py-3.5 px-4 ${
                      isDark ? "bg-dark-card" : "bg-white"
                    }`
                  : "flex-row items-center gap-2.5 py-2"
              }
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: selected ? "#2563EB" : isDark ? "#475569" : "#cbd5e1",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#2563EB",
                    }}
                  />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className={`text-[14px] font-semibold ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  {o.label}
                </Text>
                {o.description && (
                  <Text
                    className={`text-[12px] mt-0.5 ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    {o.description}
                  </Text>
                )}
              </View>
            </View>
            {divider && (
              <View
                className={`ml-12 h-px ${
                  isDark ? "bg-dark-border" : "bg-gray-100"
                }`}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
