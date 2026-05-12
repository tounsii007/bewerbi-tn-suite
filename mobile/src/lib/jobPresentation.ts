import type { JobType } from "../types";

export type BadgeVariant = "default" | "info" | "success" | "warning" | "error";

export const jobTypeBadgeVariant: Record<JobType, BadgeVariant> = {
  job: "info",
  ausbildung: "success",
  studium: "warning",
  sprachkurs: "default",
};

export const jobTypeAccentClass: Record<JobType, string> = {
  job: "bg-primary-500",
  ausbildung: "bg-success-500",
  studium: "bg-warning-500",
  sprachkurs: "bg-gray-400",
};

export function timeAgoDe(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 30) return `vor ${days} Tagen`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `vor ${months} ${months === 1 ? "Monat" : "Monaten"}`;
  }
  const years = Math.floor(days / 365);
  return `vor ${years} ${years === 1 ? "Jahr" : "Jahren"}`;
}
