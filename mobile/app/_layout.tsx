import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { I18nManager, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/stores/authStore";
import { useThemeStore } from "../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../src/lib/supabase";
import { ToastProvider } from "../src/components/ui/Toast";
import "../src/i18n";
import i18n from "../src/i18n";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const { setSession, fetchProfile, setLoading } = useAuthStore();
  const { isDark, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();

    if (Platform.OS !== "web") {
      SplashScreen.hideAsync();
    }

    const isRTL = i18n.language === "ar";
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }

    if (IS_MOCK_MODE) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) fetchProfile();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: isDark ? "#0f172a" : "#f8fafc",
              },
              animation: Platform.OS === "web" ? "none" : "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(applicant)" />
            <Stack.Screen name="(employer)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
