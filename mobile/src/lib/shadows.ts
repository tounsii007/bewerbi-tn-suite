import { Platform, ViewStyle } from "react-native";

type ShadowLevel = "sm" | "md" | "lg";

const shadowMap: Record<
  ShadowLevel,
  { web: ViewStyle; native: ViewStyle }
> = {
  sm: {
    web: { boxShadow: "0 1px 2px rgba(0,0,0,0.05)" } as ViewStyle,
    native: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  md: {
    web: {
      boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)",
    } as ViewStyle,
    native: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  lg: {
    web: { boxShadow: "0 8px 24px rgba(0,0,0,0.10)" } as ViewStyle,
    native: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

export function shadow(level: ShadowLevel = "md"): ViewStyle {
  const entry = shadowMap[level];
  return Platform.OS === "web" ? entry.web : entry.native;
}
