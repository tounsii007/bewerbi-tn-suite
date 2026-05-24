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
import { GoogleGlyph } from "./GoogleGlyph";
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

