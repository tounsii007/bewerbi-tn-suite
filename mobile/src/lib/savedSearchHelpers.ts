import type { JobCategory, JobType, LanguageLevel } from "../types";

export type AlertFrequency = "INSTANT" | "DAILY" | "WEEKLY" | "OFF";

export interface SavedSearchFilters {
  query?: string | null;
  category?: JobCategory | null;
  type?: JobType | null;
  location?: string | null;
  minGermanLevel?: LanguageLevel | null;
  salaryMin?: number | null;
}

const CATEGORY_LABELS: Record<JobCategory, string> = {
  it: "IT",
  pflege: "Pflege",
  transport: "Transport",
  sonstige: "Sonstige",
};

const TYPE_LABELS: Record<JobType, string> = {
  job: "Job",
  ausbildung: "Ausbildung",
  studium: "Studium",
  sprachkurs: "Sprachkurs",
};

/**
 * Auto-generate a human-readable name from filters.
 * "React · IT · Berlin" instead of "Suche 12.04.2026".
 */
export function smartName(filters: SavedSearchFilters): string {
  const parts: string[] = [];
  if (filters.query) parts.push(`"${filters.query}"`);
  if (filters.category) parts.push(CATEGORY_LABELS[filters.category]);
  if (filters.type) parts.push(TYPE_LABELS[filters.type]);
  if (filters.location) parts.push(filters.location);
  if (filters.minGermanLevel) parts.push(`Deutsch ${filters.minGermanLevel}+`);
  if (filters.salaryMin) parts.push(`ab ${Math.round(filters.salaryMin / 1000)}k €`);
  return parts.length > 0 ? parts.join(" · ") : "Alle Stellen";
}

export const ALERT_FREQUENCY_LABELS: Record<AlertFrequency, string> = {
  INSTANT: "Sofort",
  DAILY: "Täglich",
  WEEKLY: "Wöchentlich",
  OFF: "Aus",
};

/**
 * Client-side helper: count how many jobs match a saved search in the
 * currently loaded list. Used for the "X neue seit letztem Besuch" badge.
 */
export function matchJobs<T extends {
  title: string;
  description?: string;
  category: JobCategory;
  type: JobType;
  location: string;
  german_level?: LanguageLevel | null;
  created_at: string;
}>(
  jobs: T[],
  filters: SavedSearchFilters,
  since?: string,
): { total: number; fresh: number } {
  const q = filters.query?.toLowerCase();
  const loc = filters.location?.toLowerCase();
  const sinceTs = since ? new Date(since).getTime() : 0;
  let total = 0;
  let fresh = 0;
  for (const job of jobs) {
    if (filters.category && job.category !== filters.category) continue;
    if (filters.type && job.type !== filters.type) continue;
    if (loc && !job.location.toLowerCase().includes(loc)) continue;
    if (q) {
      const blob = `${job.title} ${job.description ?? ""}`.toLowerCase();
      if (!blob.includes(q)) continue;
    }
    if (filters.minGermanLevel) {
      const levelOrder: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const job_level = job.german_level;
      if (
        job_level &&
        levelOrder.indexOf(job_level) < levelOrder.indexOf(filters.minGermanLevel)
      ) {
        continue;
      }
    }
    total += 1;
    if (sinceTs > 0 && new Date(job.created_at).getTime() > sinceTs) fresh += 1;
  }
  return { total, fresh };
}
