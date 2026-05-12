import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

const styles = {
  default: { bg: "bg-gray-100", text: "text-gray-600" },
  success: { bg: "bg-emerald-50", text: "text-emerald-700" },
  warning: { bg: "bg-amber-50", text: "text-amber-700" },
  error: { bg: "bg-red-50", text: "text-red-600" },
  info: { bg: "bg-blue-50", text: "text-blue-600" },
};

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  const s = styles[variant];
  return (
    <View className={`rounded-lg ${s.bg} ${size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5"}`}>
      <Text className={`${size === "sm" ? "text-xs" : "text-[13px]"} font-semibold ${s.text}`}>
        {label}
      </Text>
    </View>
  );
}
