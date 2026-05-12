import { View, Text } from "react-native";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react-native";
import { useTranslation } from "react-i18next";

type VerificationStatus =
  | "VERIFIED"
  | "PENDING_REVIEW"
  | "UNVERIFIED"
  | "REJECTED";

interface Props {
  status: VerificationStatus;
  size?: "sm" | "md";
}

export function VerifiedBadge({ status, size = "sm" }: Props) {
  const { t } = useTranslation();
  const dims = size === "md" ? { icon: 14, py: "py-1.5", text: "text-[12px]" } : { icon: 12, py: "py-1", text: "text-[11px]" };

  if (status === "VERIFIED") {
    return (
      <View className={`flex-row items-center gap-1 px-2 ${dims.py} rounded-full bg-success-100`}>
        <ShieldCheck size={dims.icon} color="#059669" />
        <Text className={`${dims.text} font-bold text-success-700`}>
          {t("employer.verified")}
        </Text>
      </View>
    );
  }
  if (status === "PENDING_REVIEW") {
    return (
      <View className={`flex-row items-center gap-1 px-2 ${dims.py} rounded-full bg-warning-100`}>
        <ShieldQuestion size={dims.icon} color="#92400e" />
        <Text className={`${dims.text} font-bold text-warning-700`}>
          {t("employer.pendingVerification")}
        </Text>
      </View>
    );
  }
  return (
    <View className={`flex-row items-center gap-1 px-2 ${dims.py} rounded-full bg-gray-100`}>
      <ShieldAlert size={dims.icon} color="#6b7280" />
      <Text className={`${dims.text} font-semibold text-gray-600`}>
        {t("employer.unverified")}
      </Text>
    </View>
  );
}
