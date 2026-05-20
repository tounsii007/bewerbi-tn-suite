/**
 * Plain-JS design tokens shared by NativeWind classes and ad-hoc inline styles. Keep in sync
 * with `tailwind.config.js` and (in Iter 9) the canonical `shared/tokens/*.json` source.
 *
 * Why duplicate the colours from the Tailwind config? Two reasons:
 *  1. Inline RN styles can't read Tailwind class values at runtime.
 *  2. Reanimated worklets need plain primitives, not lookups.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  card: 20,
  section: 28,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 22,
  "3xl": 28,
  pill: 9999,
} as const;

export const motion = {
  // Durations are in milliseconds — handy for `withTiming(value, { duration: motion.fast })`.
  fast: 140,
  normal: 220,
  slow: 420,
  // Reanimated spring presets that match the marketing site's micro-interactions.
  press: { damping: 15, stiffness: 400, mass: 0.7 },
  enter: { damping: 18, stiffness: 200, mass: 0.85 },
  bounce: { damping: 10, stiffness: 280, mass: 0.9 },
} as const;

export const palette = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#2563EB",
    600: "#2451cc",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  accent: {
    500: "#DC2626",
    600: "#b91c1c",
  },
  success: {
    500: "#16a34a",
    600: "#059669",
  },
  warning: {
    500: "#f59e0b",
    600: "#d97706",
  },
  info: {
    500: "#06b6d4",
    600: "#0891b2",
  },
  dark: {
    bg: "#0f172a",
    card: "#1e293b",
    border: "#334155",
    text: "#e2e8f0",
    muted: "#94a3b8",
  },
  light: {
    bg: "#f8fafc",
    card: "#ffffff",
    border: "#e2e8f0",
    text: "#0f172a",
    muted: "#64748b",
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;

/* ─────────────────────────────────────────────────────────────────────────
 * Iter 125 — gradient stops for the mobile glass system.
 * Use with <LinearGradient colors={GRADIENT_BRAND}> or the GradientText
 * primitive. Mirrors the web `GradientText` variants exactly.
 * ───────────────────────────────────────────────────────────────────────── */
export const GRADIENT_BRAND = [
  palette.primary[500],
  "#6d4cf7",
  palette.primary[500],
] as const;

export const GRADIENT_AURORA = [
  palette.primary[500],
  palette.accent[500],
  palette.warning[500],
  palette.success[500],
  palette.info[500],
] as const;

export const GRADIENT_SUNRISE = [
  palette.accent[500],
  palette.warning[500],
  palette.accent[500],
] as const;

export const GRADIENT_FLAME = [
  palette.accent[500],
  "#9c39e8",
  palette.primary[500],
] as const;

/** Dark pill background used inside ShimmerButton's inner surface. */
export const GRADIENT_PILL_DARK = ["#0f172a", "#1e293b"] as const;

/** Translucent overlays for AuroraBackground blobs. */
export const AURORA_BLOBS_LIGHT = [
  "rgba(59, 130, 246, 0.45)",
  "rgba(220, 38, 38,  0.35)",
  "rgba(22, 163, 74,  0.35)",
  "rgba(6, 182, 212,  0.35)",
] as const;

export const AURORA_BLOBS_DARK = [
  "rgba(37, 81, 204,  0.45)",
  "rgba(185, 28, 28,  0.30)",
  "rgba(5, 150, 105,  0.30)",
  "rgba(8, 145, 178,  0.30)",
] as const;
