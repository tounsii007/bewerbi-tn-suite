import { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Svg, Path } from "react-native-svg";
import { useAuthStore } from "../../stores/authStore";
import { apiErrorMessage } from "../../lib/apiError";
import { useThemeStore } from "../../hooks/useColorScheme";
import type { UserRole } from "../../types";

// Iter 166 — needed by expo-auth-session for the OAuth callback to
// return control to the app. Safe to call multiple times.
WebBrowser.maybeCompleteAuthSession();

/**
 * Iter 166 — env-gated Google client IDs.
 *
 * We need *three* IDs because Google Sign-In returns ID tokens scoped
 * to a specific OAuth client per platform:
 *   - iOS:        EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID
 *   - Android:    EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID
 *   - Expo Go /   EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID
 *     web         (also the audience the backend verifies against)
 *
 * The backend's `GoogleIdTokenVerifier` (Iter 160) checks the token's
 * `aud` claim against `GOOGLE_OAUTH_CLIENT_ID` — typically set to the
 * web client ID, with iOS + Android client IDs added to the audience
 * allowlist in Google Cloud Console.
 */
function googleOAuthEnabled(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID
      || process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID
      || process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  );
}

/**
 * Iter 166 — "Mit Google anmelden" button for the RN app.
 *
 * Uses `expo-auth-session/providers/google` which wraps the platform
 * GIS flow (system browser on iOS/Android, web-browser auth-session
 * on Expo Go). The success callback gives us an `id_token` which we
 * post to our backend's `/api/v1/auth/google` endpoint via
 * `authStore.signInWithGoogle()`.
 *
 * Hidden entirely when no Google client IDs are configured. Mock-mode
 * builds also skip this — Google sign-in is API-mode-only.
 */
export function GoogleSignInButton({
  role,
  onSuccess,
  text = "signin",
}: {
  role?: UserRole;
  onSuccess?: () => void;
  text?: "signin" | "signup";
}) {
  const { isDark } = useThemeStore();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const [busy, setBusy] = useState(false);

  const [, , promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
    scopes: ["openid", "email", "profile"],
  });

  if (!googleOAuthEnabled()) return null;

  const handlePress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        // User dismissed the pop-up, or the OAuth provider returned an
        // error — show nothing for cancel, surface the error otherwise.
        if (result.type === "error") {
          Alert.alert("Google", result.error?.message ?? "Anmeldung fehlgeschlagen");
        }
        return;
      }
      // The native flow returns the ID token via `authentication?.idToken`;
      // the auth-session-on-web flow puts it in `params.id_token`.
      const idToken =
        result.authentication?.idToken
        ?? (result.params as Record<string, string>)?.id_token;
      if (!idToken) {
        Alert.alert("Google", "Kein ID-Token von Google erhalten.");
        return;
      }
      await signInWithGoogle(idToken, role);
      onSuccess?.();
    } catch (e) {
      Alert.alert(
        "Google",
        apiErrorMessage(e, "Google-Anmeldung fehlgeschlagen."),
      );
    } finally {
      setBusy(false);
    }
  };

  const label = text === "signup" ? "Mit Google registrieren" : "Mit Google anmelden";

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={busy}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isDark ? "rgba(148,163,184,0.3)" : "#d1d5db",
        backgroundColor: isDark ? "rgba(15,23,42,0.6)" : "#ffffff",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy
        ? <ActivityIndicator size="small" color={isDark ? "#cbd5e1" : "#374151"} />
        : <GoogleGlyph />}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: isDark ? "#e2e8f0" : "#374151",
        }}
      >
        {busy ? "Anmelden bei Google…" : label}
      </Text>
    </TouchableOpacity>
  );
}

/** Inline SVG Google "G" — same multicolour glyph used on the web. */
function GoogleGlyph() {
  return (
    <View style={{ width: 18, height: 18 }}>
      <Svg width={18} height={18} viewBox="0 0 48 48">
        <Path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <Path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
        />
        <Path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
        />
        <Path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.4 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </Svg>
    </View>
  );
}
