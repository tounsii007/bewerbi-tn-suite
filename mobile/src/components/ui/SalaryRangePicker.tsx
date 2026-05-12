import { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Sparkles } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useThemeStore } from "../../hooks/useColorScheme";
import {
  convert,
  distribution,
  formatK,
  MARKET_RANGES,
  type Currency,
  type JobLikeForSalary,
} from "../../lib/salaryMarket";
import type { JobCategory } from "../../types";

interface SalaryRangePickerProps {
  min?: number;
  max?: number;
  onChange: (range: { min?: number; max?: number }) => void;
  buckets?: number[];
  category?: JobCategory;
  /** Pass the current result list to render a live distribution histogram. */
  jobs?: readonly JobLikeForSalary[];
}

const DEFAULT_BUCKETS = [
  0, 20_000, 30_000, 40_000, 50_000, 60_000, 75_000, 90_000, 120_000,
];

export function SalaryRangePicker({
  min,
  max,
  onChange,
  buckets = DEFAULT_BUCKETS,
  category,
  jobs = [],
}: SalaryRangePickerProps) {
  const { isDark } = useThemeStore();
  const [localMin, setLocalMin] = useState<number | undefined>(min);
  const [localMax, setLocalMax] = useState<number | undefined>(max);
  const [currency, setCurrency] = useState<Currency>("EUR");

  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

  const histogram = useMemo(() => distribution(jobs, buckets), [jobs, buckets]);
  const histMax = Math.max(1, ...histogram);
  const market = category ? MARKET_RANGES[category] : undefined;

  const toDisplay = (eur: number) => convert(eur, "EUR", currency);

  const apply = (nextMin?: number, nextMax?: number) => {
    setLocalMin(nextMin);
    setLocalMax(nextMax);
    onChange({ min: nextMin, max: nextMax });
  };

  const symbol = currency === "EUR" ? "€" : "DT";
  const label =
    localMin == null && localMax == null
      ? "Alle Gehälter"
      : localMax == null
        ? `ab ${formatK(toDisplay(localMin!))} ${symbol}`
        : localMin == null
          ? `bis ${formatK(toDisplay(localMax))} ${symbol}`
          : `${formatK(toDisplay(localMin))} – ${formatK(toDisplay(localMax))} ${symbol}`;

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className={`text-[13px] font-semibold uppercase tracking-wider ${
            isDark ? "text-dark-muted" : "text-gray-400"
          }`}
        >
          Gehalt ({symbol})
        </Text>
        <View
          className={`flex-row rounded-full p-0.5 ${
            isDark ? "bg-dark-border" : "bg-gray-100"
          }`}
        >
          {(["EUR", "TND"] as const).map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCurrency(c)}
              className={`px-3 py-1 rounded-full ${
                currency === c ? (isDark ? "bg-dark-card" : "bg-white") : ""
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  currency === c
                    ? "text-primary-600"
                    : isDark
                      ? "text-dark-muted"
                      : "text-gray-500"
                }`}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text className={`text-[15px] font-bold mb-3 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
        {label}
      </Text>

      {histogram.some((c) => c > 0) && (
        <Animated.View entering={FadeIn} className="mb-4">
          <View className="flex-row items-end gap-0.5 h-12">
            {histogram.map((count, i) => {
              const heightPct = (count / histMax) * 100;
              const bucketStart = buckets[i];
              const inRange =
                (localMin == null || bucketStart >= localMin) &&
                (localMax == null || bucketStart <= localMax);
              return (
                <View
                  key={i}
                  className={`flex-1 rounded-t ${
                    inRange
                      ? "bg-primary-500"
                      : isDark
                        ? "bg-dark-border"
                        : "bg-gray-200"
                  }`}
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                />
              );
            })}
          </View>
          <Text
            className={`text-[10px] mt-1 ${
              isDark ? "text-dark-muted" : "text-gray-400"
            }`}
          >
            {jobs.filter((j) => j.salary_min || j.salary_max).length} Stellen mit
            Gehaltsangabe
          </Text>
        </Animated.View>
      )}

      {market && (
        <View
          className={`flex-row items-start gap-2 rounded-xl px-3 py-2 mb-4 ${
            isDark ? "bg-dark-card" : "bg-primary-50"
          }`}
        >
          <Sparkles size={14} color="#2563EB" />
          <Text className={`text-[12px] flex-1 ${isDark ? "text-dark-muted" : "text-primary-700"}`}>
            <Text className="font-bold">Marktüblich:</Text>{" "}
            {formatK(toDisplay(market.p25))} – {formatK(toDisplay(market.p75))}{" "}
            {symbol} · Median {formatK(toDisplay(market.p50))} {symbol}
          </Text>
        </View>
      )}

      <View className="mb-4">
        <Text className={`text-[11px] mb-2 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
          Minimum
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <BucketChip
            label="Alle"
            active={localMin == null}
            onPress={() => apply(undefined, localMax)}
          />
          {buckets.slice(1).map((b) => (
            <BucketChip
              key={`min-${b}`}
              label={`${formatK(toDisplay(b))}+`}
              active={localMin === b}
              onPress={() =>
                apply(b, localMax != null && localMax < b ? undefined : localMax)
              }
            />
          ))}
        </View>
      </View>

      <View>
        <Text className={`text-[11px] mb-2 ${isDark ? "text-dark-muted" : "text-gray-500"}`}>
          Maximum
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <BucketChip
            label="∞"
            active={localMax == null}
            onPress={() => apply(localMin, undefined)}
          />
          {buckets.slice(1).map((b) => {
            const disabled = localMin != null && b < localMin;
            return (
              <BucketChip
                key={`max-${b}`}
                label={`bis ${formatK(toDisplay(b))}`}
                active={localMax === b}
                disabled={disabled}
                onPress={() => !disabled && apply(localMin, b)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function BucketChip({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { isDark } = useThemeStore();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full border ${
        disabled
          ? "opacity-30 border-gray-200"
          : active
            ? "bg-primary-500 border-primary-500"
            : isDark
              ? "border-dark-border bg-dark-card"
              : "border-gray-200 bg-white"
      }`}
    >
      <Text
        className={`text-[13px] font-semibold ${
          active
            ? "text-white"
            : isDark
              ? "text-dark-text"
              : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
