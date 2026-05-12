"use client";

import Link from "next/link";
import { Clock, Heart, MapPin } from "lucide-react";
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

const TYPE_ACCENT: Record<JobType, string> = {
  JOB: "bg-primary-500",
  AUSBILDUNG: "bg-success-500",
  STUDIUM: "bg-warning-500",
  SPRACHKURS: "bg-gray-400",
  PRAKTIKUM: "bg-gray-400",
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

export function JobCard({ job, isFavorite, onFavorite, href }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)] dark:border-dark-border dark:bg-dark-card">
      <div className={cn("h-1", TYPE_ACCENT[job.type])} />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={TYPE_VARIANT[job.type]}>{TYPE_LABEL[job.type]}</Badge>
            <Badge variant="default">{CATEGORY_LABEL[job.category]}</Badge>
            {job.germanLevel && <Badge variant="info">Deutsch {job.germanLevel}</Badge>}
            {job.premium && <Badge variant="warning">Premium</Badge>}
          </div>
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavorite();
              }}
              aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-colors",
                isFavorite
                  ? "bg-accent-50 text-accent-600"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-dark-bg dark:text-dark-muted",
              )}
            >
              <Heart className="size-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <Link href={href ?? `/jobs/${job.id}`} className="group block focus:outline-none">
          <h3 className="text-base font-bold leading-6 text-gray-900 group-hover:text-primary-600 dark:text-dark-text dark:group-hover:text-primary-300 line-clamp-2">
            {job.title}
          </h3>
          <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-dark-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {job.location}
            </span>
            {salary && <span className="font-semibold text-gray-800 dark:text-dark-text">{salary}</span>}
            <span className="ms-auto inline-flex items-center gap-1 text-xs">
              <Clock className="size-3" /> {timeAgoDe(job.createdAt)}
            </span>
          </p>
        </Link>
      </div>
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[var(--shadow-md)] dark:border-dark-border dark:bg-dark-card">
      <div className="h-1 bg-gray-200 dark:bg-dark-border" />
      <div className="animate-pulse p-5">
        <div className="mb-3 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-dark-border" />
          <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-dark-border" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-dark-border" />
        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-dark-border" />
        <div className="mt-4 flex gap-3">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-dark-border" />
        </div>
      </div>
    </div>
  );
}
