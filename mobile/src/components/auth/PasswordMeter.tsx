import { useMemo } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { evaluatePassword } from "@shared/password-strength";

const BAR_COLORS: Record<number, string> = {
  0: "#dc2626",
  1: "#dc2626",
  2: "#f59e0b",
  3: "#10b981",
  4: "#059669",
};

/**
 * Compact strength indicator that runs the shared evaluator. Identical
 * scoring to the web meter and the backend validator, so what shows
 * green here will also pass the 422 gate on submit.
 */
export function PasswordMeter({ value }: { value: string }) {
  const { t } = useTranslation();
  const result = useMemo(() => evaluatePassword(value), [value]);
  if (!value) return null;
  const barColor = BAR_COLORS[result.score];

  return (
    <View style={{ marginTop: 6, gap: 4 }}>
      <View style={{ flexDirection: "row", gap: 4, height: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              borderRadius: 3,
              backgroundColor: i < result.score ? barColor : "#e2e8f0",
            }}
          />
        ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 12, color: "#6b7280" }}>
          {t(`auth.password.strength.${result.label}`)}
        </Text>
        {result.suggestions.length > 0 && result.score < 3 && (
          <Text
            style={{ fontSize: 12, color: "#9ca3af" }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t(`error.auth.password.weak.${result.suggestions[0]}`)}
          </Text>
        )}
      </View>
    </View>
  );
}
