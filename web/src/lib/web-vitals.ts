/**
 * Reports Core Web Vitals to the analytics pipeline. Mount inside `<Suspense>` boundary
 * (Next 15 `reportWebVitals` API or via `useReportWebVitals` hook).
 *
 * The thresholds below are Google's "good" buckets — anything beyond gets flagged.
 *
 * Wire-up in `app/layout.tsx`:
 *
 *   "use client";
 *   import { useReportWebVitals } from "next/web-vitals";
 *   import { reportWebVital } from "@/lib/web-vitals";
 *
 *   export default function RootLayout(...) {
 *     useReportWebVitals(reportWebVital);
 *     ...
 *   }
 */
import { analytics } from "./analytics";

type Metric = {
  name: "FCP" | "LCP" | "CLS" | "FID" | "TTFB" | "INP" | string;
  value: number;
  id: string;
  rating?: "good" | "needs-improvement" | "poor";
  navigationType?: string;
};

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP:  { good: 2500, poor: 4000 },
  FID:  { good: 100,  poor: 300  },
  INP:  { good: 200,  poor: 500  },
  CLS:  { good: 0.1,  poor: 0.25 },
  FCP:  { good: 1800, poor: 3000 },
  TTFB: { good: 800,  poor: 1800 },
};

function bucket(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const t = THRESHOLDS[name];
  if (!t) return "good";
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

export function reportWebVital(metric: Metric) {
  analytics.track("web_vital", {
    name: metric.name,
    value: Math.round(metric.value),
    id: metric.id,
    rating: metric.rating ?? bucket(metric.name, metric.value),
    navigationType: metric.navigationType ?? null,
  });

  // Mirror to the console in dev so developers can spot regressions locally.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info(`[web-vitals] ${metric.name} ${Math.round(metric.value)} (${metric.rating ?? bucket(metric.name, metric.value)})`);
  }
}
