import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { AlertCircle, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";
import { authApi, IS_API_MODE } from "../../lib/apiClient";
import { apiErrorMessage } from "../../lib/apiError";

/**
 * Reminder that the signed-in user hasn't confirmed their address yet.
 * Mirrors the web banner from Iter 69. Renders nothing for verified
 * users, anonymous visitors, or mock-mode sessions where the field is
 * undefined. Dismissal is in-memory only so the banner returns on
 * every app launch until the user actually verifies.
 */
export function VerifyEmailBanner() {
  const { t } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!session?.user?.email) return null;
  if (session.user.emailVerified !== false) return null; // null/undefined → skip
  if (dismissed) return null;

  const resend = async () => {
    if (!IS_API_MODE) return;
    setSending(true);
    try {
      await authApi.resendVerification(session.user.email ?? "");
      Alert.alert(
        "Bestätigungs-Mail unterwegs",
        "Wir haben dir einen neuen Link geschickt.",
      );
    } catch (e) {
      Alert.alert(
        t("common.error"),
        apiErrorMessage(e, "Senden fehlgeschlagen."),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#fef3c7",
        borderColor: "#fcd34d",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginTop: 12,
      }}
    >
      <AlertCircle size={18} color="#92400e" />
      <Text style={{ flex: 1, color: "#92400e", fontSize: 13 }}>
        Deine E-Mail ist noch nicht bestätigt.
      </Text>
      <TouchableOpacity
        onPress={resend}
        disabled={sending}
        style={{
          backgroundColor: "#d97706",
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          opacity: sending ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
          {sending ? "Senden…" : "Erneut senden"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={8}>
        <X size={16} color="#92400e" />
      </TouchableOpacity>
    </View>
  );
}
