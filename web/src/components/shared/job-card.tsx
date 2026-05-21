"use client";

import { memo } from "react";
import Link from "next/link";
import { Building2, Clock, Heart, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import type { Job, JobCategory, JobType } from "@/lib/types";

const CATEGORY_LABEL: Record<JobCategory, string> = {
  IT: "IT",
  PFLEGE: "Pflege",
  TRANSPORT: "Transport",
  HANDWERK: "Handwerk",
  GASTRO: "Gastro",
  BAU: "Bau",
  SONSTIGE: "Sonstige",
};

const TYPE_LABEL: Record<JobType, string> = {
  JOB: "Job",
  AUSBILDUNG: "Ausbildung",
  STUDIUM: "Studium",
  SPRACHKURS: "Sprachkurs",
  PRAKTIKUM: "Praktikum",
};

const TYPE_VARIANT: Record<JobType, "info" | "success" | "warning" | "default"> = {
  JOB: "info",
  AUSBILDUNG: "success",
  STUDIUM: "warning",
  SPRACHKURS: "default",
  PRAKTIKUM: "default",
};

/** Accent gradient per type — used for the top bar and the hover halo. */
const TYPE_GRADIENT: Record<JobType, string> = {
  JOB: "from-primary-400 via-primary-500 to-primary-600",
  AUSBILDUNG: "from-success-400 via-success-500 to-success-600",
  STUDIUM: "from-warning-400 via-warning-500 to-warning-600",
  SPRACHKURS: "from-info-400 via-info-500 to-info-600",
  PRAKTIKUM: "from-gray-400 via-gray-500 to-gray-600",
};

function timeAgoDe(date: string): string {
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

function formatSalary(min?: number | null, max?: number | null, currency = "EUR"): string | null {
  if (!min && !max) return null;
  const symbol = currency === "EUR" ? "€" : currency;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${symbol}`;
  if (min) return `ab ${fmt(min)} ${symbol}`;
  return `bis ${fmt(max!)} ${symbol}`;
}

interface JobCardProps {
  job: Job;
  isFavorite?: boolean;
  onFavorite?: () => void;
  href?: string;
}

function JobCardImpl({ job, isFavorite, onFavorite, href }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const gradient = TYPE_GRADIENT[job.type];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[var(--shadow-sm)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-xl)] hover:border-primary-200",
        "dark:border-dark-border dark:bg-dark-card dark:hover:border-primary-500/40",
      )}
    >
      {/* Top gradient bar — type-coloured */}
      <div className={cn("h-1 bg-gradient-to-r", gradient)} />

      {/* Hover-only colour wash — sits at -1 so the border still shows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(120%_60%_at_0%_0%,oklch(0.611_0.1733_254/0.06),transparent_50%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(120%_60%_at_0%_0%,oklch(0.611_0.1733_254/0.12),transparent_50%)]"
      />

      <div className="relative p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={TYPE_VARIANT[job.type]}>{TYPE_LABEL[job.type]}</Badge>
            <Badge variant="default">{CATEGORY_LABEL[job.category]}</Badge>
            {job.germanLevel && <Badge variant="info">Deutsch {job.germanLevel}</Badge>}
            {job.premium && (
              <Badge variant="warning">
                <Sparkles className="size-3" />
                Premium
              </Badge>
            )}
          </div>
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavorite();
              }}
              aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              aria-pressed={isFavorite}
              className={cn(
                "press flex size-9 items-center justify-center rounded-full transition-colors",
                isFavorite
                  ? "bg-accent-500/15 text-accent-600 hover:bg-accent-500/25"
                  : "bg-gray-50 text-gray-400 hover:bg-accent-50 hover:text-accent-500 dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-accent-500/15",
              )}
            >
              <Heart
                className={cn("size-4 transition-transform", isFavorite && "scale-110")}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>

        <Link
          href={href ?? `/jobs/${job.id}`}
          className="block focus:outline-none"
        >
          <h3 className="line-clamp-2 text-base font-bold leading-6 text-gray-900 transition-colors group-hover:text-primary-600 dark:text-dark-text dark:group-hover:text-primary-300">
            {job.title}
          </h3>

          {/* Company line — falls back gracefully if no companyName on the type */}
          {"companyName" in job && job.companyName ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-dark-muted">
              <Building2 className="size-3.5 text-gray-400" />
              {String(job.companyName)}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-dark-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {job.location}
            </span>
            {salary && (
              <span className="rounded-md bg-success-500/10 px-2 py-0.5 font-bold text-success-700 dark:text-success-500">
                {salary}
              </span>
            )}
            <span className="ms-auto inline-flex items-center gap-1 text-xs text-gray-400 dark:text-dark-muted">
              <Clock className="size-3" /> {timeAgoDe(job.createdAt)}
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}

/**
 * Iter 153 — memoize JobCard so it skips re-renders when its props are
 * referentially stable. In the search page, filter-chip toggles cause
 * the whole list to re-render; memo cuts the cost when the underlying
 * jobs haven't changed. (Note: callers that pass new `onFavorite`
 * closures every render will still re-render; wrapping that with
 * useCallback in the caller is the follow-up win.)
 */
export const JobCard = memo(JobCardImpl);

export function JobCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[var(--shadow-sm)] dark:border-dark-border dark:bg-dark-card">
      <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-dark-border dark:to-dark-border" />
      <div className="animate-pulse p-5">
        <div className="mb-3 flex gap-2">
          <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-dark-border" />
          <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-dark-border" />
          <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-dark-border" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-dark-border" />
        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-dark-border" />
        <div className="mt-4 flex items-center gap-3">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="ms-auto h-3 w-12 rounded bg-gray-200 dark:bg-dark-border" />
        </div>
      </div>
    </div>
  );
}
