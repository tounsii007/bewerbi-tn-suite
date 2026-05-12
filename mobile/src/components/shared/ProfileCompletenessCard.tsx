import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import { useAnimatedCounter } from "../../hooks/useAnimatedCounter";
import {
  compute,
  TIER_META,
  type ProfileForCompleteness,
} from "../../lib/profileCompleteness";

interface Props {
  profile: ProfileForCompleteness | null;
  compact?: boolean;
}

export function ProfileCompletenessCard({ profile, compact = false }: Props) {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const router = useRouter();
  const { percent, tier, nextAction } = compute(profile);
  const animated = useAnimatedCounter(percent);
  const tierMeta = TIER_META[tier];

  const follow = () => {
    if (!nextAction) return;
    router.push(nextAction.route as never);
  };

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <View
        className={`rounded-3xl overflow-hidden ${
          isDark ? "bg-dark-card border border-dark-border" : "bg-white border border-gray-100"
        }`}
      >
        <View className="p-5">
          <View className="flex-row items-center gap-3">
            <View
              className={`w-14 h-14 rounded-full items-center justify-center ${tierMeta.bgClass}`}
            >
              <Text className="text-2xl">{tierMeta.emoji}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-baseline gap-2">
                <Text
                  className={`text-[28px] font-extrabold ${
                    isDark ? "text-dark-text" : "text-gray-900"
                  }`}
                >
                  {Math.round(animated)}
                  <Text className="text-base">%</Text>
                </Text>
                <Text
                  className={`text-[11px] font-bold uppercase tracking-wider`}
                  style={{ color: tierMeta.color }}
                >
                  {t(tierMeta.labelKey, { defaultValue: tier })}
                </Text>
              </View>
              <Text
                className={`text-[12px] mt-0.5 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                {t("profile.completeness", { defaultValue: "Profil-Vollständigkeit" })}
              </Text>
            </View>
          </View>

          <View
            className={`h-2 rounded-full overflow-hidden mt-4 ${
              isDark ? "bg-dark-border" : "bg-gray-200"
            }`}
          >
            <View
              className="h-full"
              style={{
                width: `${percent}%`,
                backgroundColor: tierMeta.color,
              }}
            />
          </View>
        </View>

        {!compact && nextAction && (
          <TouchableOpacity
            onPress={follow}
            className={`flex-row items-center gap-3 px-5 py-4 border-t ${
              isDark ? "border-dark-border" : "border-gray-100"
            }`}
            style={{ backgroundColor: tierMeta.color + "14" }}
          >
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: tierMeta.color + "22" }}
            >
              <Sparkles size={16} color={tierMeta.color} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-[11px] font-bold uppercase tracking-wider`}
                style={{ color: tierMeta.color }}
              >
                {t("profile.nextAction", { defaultValue: "Nächster Schritt" })} · +
                {nextAction.weight}%
              </Text>
              <Text
                className={`text-[14px] font-semibold ${
                  isDark ? "text-dark-text" : "text-gray-900"
                }`}
              >
                {t(nextAction.actionKey, { defaultValue: t(nextAction.labelKey) })}
              </Text>
            </View>
            <ChevronRight size={18} color={tierMeta.color} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
