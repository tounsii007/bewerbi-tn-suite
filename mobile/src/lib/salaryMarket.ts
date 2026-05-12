import type { JobCategory } from "../types";

export type Currency = "EUR" | "TND";

export interface SalaryDatapoint {
  salary: number;
  label?: string;
}

/**
 * Rough market ranges (EUR, gross/year) for the German market — sourced from
 * the Blue Card thresholds and StepStone 2024 data. Revise as needed.
 */
export const MARKET_RANGES: Record<JobCategory, { p25: number; p50: number; p75: number }> = {
  it: { p25: 48_000, p50: 62_000, p75: 82_000 },
  pflege: { p25: 32_000, p50: 38_000, p75: 46_000 },
  transport: { p25: 28_000, p50: 34_000, p75: 42_000 },
  sonstige: { p25: 30_000, p50: 42_000, p75: 58_000 },
};

const EUR_TND_RATE = 3.35; // 1 EUR ≈ 3.35 TND (2024 average)

export function convert(value: number, from: Currency, to: Currency): number {
  if (from === to) return value;
  if (from === "EUR" && to === "TND") return value * EUR_TND_RATE;
  return value / EUR_TND_RATE;
}

export function formatK(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}

/** Shape accepted by `distribution()` — works with both the Java backend's
 * `salary_min/max` integer fields and the legacy `salary_range` free-text. */
export interface JobLikeForSalary {
  salary_min?: number | null;
  salary_max?: number | null;
  salary_range?: string | null;
}

function parseSalaryRange(text: string): [number | null, number | null] {
  const matches = Array.from(text.matchAll(/(\d[\d.]*)(k)?/gi));
  const values = matches
    .map((m) => {
      const raw = m[1].replace(/\./g, "");
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? (m[2] ? n * 1000 : n) : null;
    })
    .filter((v): v is number => v != null);
  if (values.length === 0) return [null, null];
  if (values.length === 1) return [values[0], null];
  return [values[0], values[values.length - 1]];
}

/**
 * Build a lightweight distribution histogram from current job salaries
 * bucketed by the provided edges. Values are interpreted as EUR.
 */
export function distribution(
  jobs: readonly JobLikeForSalary[],
  buckets: number[],
): number[] {
  const counts = new Array(buckets.length).fill(0);
  for (const job of jobs) {
    let min = job.salary_min ?? null;
    let max = job.salary_max ?? null;
    if (min == null && max == null && job.salary_range) {
      [min, max] = parseSalaryRange(job.salary_range);
    }
    const midpoint =
      min != null && max != null ? (min + max) / 2 : (min ?? max ?? 0);
    if (!midpoint) continue;
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (midpoint >= buckets[i]) {
        counts[i] += 1;
        break;
      }
    }
  }
  return counts;
}
