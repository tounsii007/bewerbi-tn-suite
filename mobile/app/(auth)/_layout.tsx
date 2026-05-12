import { Stack } from "expo-router";
import { useThemeStore } from "../../src/hooks/useColorScheme";

export default function AuthLayout() {
  const { isDark } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#0f172a" : "#f8fafc" },
        animation: "slide_from_right",
      }}
    />
  );
}
