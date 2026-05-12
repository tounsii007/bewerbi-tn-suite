import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { MapPin, Clock, Heart } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Badge } from "../ui/Badge";
import { useThemeStore } from "../../hooks/useColorScheme";
import { shadow } from "../../lib/shadows";
import {
  jobTypeAccentClass,
  jobTypeBadgeVariant,
  timeAgoDe,
} from "../../lib/jobPresentation";
import type { Job } from "../../types";

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  index?: number;
}

export function JobCard({
  job,
  onPress,
  onFavorite,
  isFavorite,
  index = 0,
}: JobCardProps) {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.65}>
        <View
          className={`rounded-2xl mb-3 overflow-hidden ${
            isDark ? "bg-dark-card border border-dark-border" : "bg-white"
          }`}
          style={isDark ? undefined : shadow("md")}
        >
          <View className={`h-1 ${jobTypeAccentClass[job.type]}`} />

          <View className="p-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row gap-2 flex-wrap flex-1 mr-2">
                <Badge
                  label={t(`jobs.${job.type}`)}
                  variant={jobTypeBadgeVariant[job.type]}
                />
                <Badge label={t(`jobs.${job.category}`)} />
                {job.german_level && (
                  <Badge label={`Deutsch ${job.german_level}`} variant="info" />
                )}
              </View>
              {onFavorite && (
                <TouchableOpacity
                  onPress={onFavorite}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    isFavorite
                      ? "bg-accent-50"
                      : isDark
                        ? "bg-dark-bg"
                        : "bg-gray-50"
                  }`}
                >
                  <Heart
                    size={18}
                    color={isFavorite ? "#DC2626" : "#cbd5e1"}
                    fill={isFavorite ? "#DC2626" : "none"}
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text
              numberOfLines={2}
              className={`text-base font-bold leading-6 ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {job.title}
            </Text>

            {job.employer && (
              <Text
                numberOfLines={1}
                className={`text-sm mt-1 ${
                  isDark ? "text-dark-muted" : "text-gray-500"
                }`}
              >
                {job.employer.first_name} {job.employer.last_name}
              </Text>
            )}

            <View className="flex-row items-center mt-4 gap-4 flex-wrap">
              {!!job.location && (
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={14} color={isDark ? "#64748b" : "#9ca3af"} />
                  <Text
                    numberOfLines={1}
                    className={`text-sm ${
                      isDark ? "text-dark-muted" : "text-gray-500"
                    }`}
                  >
                    {job.location}
                  </Text>
                </View>
              )}
              {job.salary_range && (
                <Text
                  className={`text-sm font-semibold ${
                    isDark ? "text-dark-text" : "text-gray-800"
                  }`}
                >
                  {job.salary_range}
                </Text>
              )}
              <View className="flex-row items-center gap-1 ml-auto">
                <Clock size={12} color={isDark ? "#475569" : "#cbd5e1"} />
                <Text
                  className={`text-xs ${
                    isDark ? "text-dark-muted" : "text-gray-400"
                  }`}
                >
                  {timeAgoDe(job.created_at)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
