import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  toggleTheme: async () => {
    const newValue = !get().isDark;
    set({ isDark: newValue });
    await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
  },
  loadTheme: async () => {
    const theme = await AsyncStorage.getItem("theme");
    set({ isDark: theme === "dark" });
  },
}));
