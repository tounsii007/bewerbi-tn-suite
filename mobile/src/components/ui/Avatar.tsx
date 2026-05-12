import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  onPress?: () => void;
  border?: boolean;
}

const sizeMap = {
  sm: { container: "w-10 h-10", text: "text-sm", ring: 2 },
  md: { container: "w-14 h-14", text: "text-lg", ring: 2 },
  lg: { container: "w-20 h-20", text: "text-2xl", ring: 3 },
  xl: { container: "w-28 h-28", text: "text-4xl", ring: 3 },
};

// Generate consistent color from name
const nameColors = ["#2563EB", "#8b5cf6", "#16a34a", "#f59e0b", "#DC2626", "#0891b2", "#d946ef"];
function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return nameColors[Math.abs(hash) % nameColors.length];
}

export function Avatar({ uri, name, size = "md", onPress, border = false }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const color = getColor(name);

  const content = uri ? (
    <View className={`${border ? "border-[3px] border-white rounded-full" : ""}`}>
      <Image
        source={{ uri }}
        className={`${sizeMap[size].container} rounded-full`}
        contentFit="cover"
        transition={300}
      />
    </View>
  ) : (
    <View
      className={`${sizeMap[size].container} rounded-full items-center justify-center ${border ? "border-[3px] border-white" : ""}`}
      style={{ backgroundColor: color + "18" }}
    >
      <Text className={`${sizeMap[size].text} font-bold`} style={{ color }}>
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}
