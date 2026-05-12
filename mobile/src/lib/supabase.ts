export const IS_MOCK_MODE = !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co";

// In mock mode, supabase is a dummy object that won't be called
// This avoids Metro trying to resolve native-only modules for web
export const supabase: any = IS_MOCK_MODE
  ? null
  : (() => {
      // Dynamic imports only when Supabase is configured
      const { createClient } = require("@supabase/supabase-js");
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      return createClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
        }
      );
    })();
