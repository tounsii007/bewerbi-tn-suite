/**
 * Cross-platform password-strength heuristic. Cheap, dependency-free,
 * deterministic — mirrors the Dart + Java ports under shared/lib/.
 *
 * It is NOT a replacement for zxcvbn — we don't ship a dictionary, and
 * the score is just a UX hint to nudge users away from obviously bad
 * passwords. The real enforcement (min length, allowed range) lives in
 * the backend validators.
 *
 * Scoring rubric (max 4):
 *   +1  length >= 8
 *   +1  length >= 12
 *   +1  three of four character classes (lower, upper, digit, symbol)
 *   +1  all four character classes AND length >= 10
 *  -1   sequential or repeating pattern penalty
 *  -1   appears in the tiny built-in common-password set
 *
 * Score is clamped to [0, 4] before returning.
 */
export interface PasswordStrengthResult {
  /** 0 = very weak, 4 = very strong. UX-only hint. */
  score: 0 | 1 | 2 | 3 | 4;
  /** Stable string ID — clients translate, do not show directly. */
  label:
    | "very-weak"
    | "weak"
    | "fair"
    | "strong"
    | "very-strong";
  /** Stable suggestion IDs (translated client-side via i18n keys
   *  `auth.password.suggest.<id>`). Empty when score >= 3. */
  suggestions: string[];
}

const COMMON = new Set([
  "password",
  "passwort",
  "123456",
  "12345678",
  "qwerty",
  "azerty",
  "abc123",
  "letmein",
  "iloveyou",
  "admin",
  "welcome",
  "monkey",
  "dragon",
  "bewerbi",
  "tunisia",
  "deutschland",
]);

function classesPresent(input: string): number {
  let c = 0;
  if (/[a-z]/.test(input)) c++;
  if (/[A-Z]/.test(input)) c++;
  if (/[0-9]/.test(input)) c++;
  if (/[^A-Za-z0-9]/.test(input)) c++;
  return c;
}

function hasSequentialRun(input: string): boolean {
  // Three or more consecutive ascending letters/digits (e.g. abc, 123).
  for (let i = 0; i < input.length - 2; i++) {
    const a = input.charCodeAt(i);
    const b = input.charCodeAt(i + 1);
    const c = input.charCodeAt(i + 2);
    if (b - a === 1 && c - b === 1) return true;
  }
  return false;
}

function hasRepeatRun(input: string): boolean {
  // Three identical chars in a row.
  return /(.)\1\1/.test(input);
}

function labelFor(score: 0 | 1 | 2 | 3 | 4): PasswordStrengthResult["label"] {
  return (
    [
      "very-weak",
      "weak",
      "fair",
      "strong",
      "very-strong",
    ] as const
  )[score];
}

export function evaluatePassword(input: string): PasswordStrengthResult {
  const value = input ?? "";
  const suggestions: string[] = [];

  let raw = 0;
  if (value.length >= 8) raw += 1;
  if (value.length >= 12) raw += 1;

  const classes = classesPresent(value);
  if (classes >= 3) raw += 1;
  if (classes === 4 && value.length >= 10) raw += 1;

  if (hasSequentialRun(value) || hasRepeatRun(value)) raw -= 1;
  if (COMMON.has(value.toLowerCase())) raw -= 1;

  if (value.length < 8) suggestions.push("length");
  if (classes < 3) suggestions.push("mixClasses");
  if (hasSequentialRun(value)) suggestions.push("noSequential");
  if (hasRepeatRun(value)) suggestions.push("noRepeats");
  if (COMMON.has(value.toLowerCase())) suggestions.push("notCommon");

  const score = Math.max(0, Math.min(4, raw)) as 0 | 1 | 2 | 3 | 4;
  return { score, label: labelFor(score), suggestions };
}
