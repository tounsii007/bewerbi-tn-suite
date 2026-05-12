"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  GraduationCap,
  HeartPulse,
  Monitor,
  Truck,
  Wrench,
  UtensilsCrossed,
} from "lucide-react";
import { jobsApi, matchingApi, profileApi, applicationsApi, favoritesApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { JobCard, JobCardSkeleton } from "@/components/shared/job-card";
import { ProfileCompletenessCard } from "@/components/shared/profile-completeness-card";
import { Card } from "@/components/ui/card";
import type { JobCategory } from "@/lib/types";

const CATEGORIES: { code: JobCategory; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { code: "IT", label: "IT", icon: Monitor, color: "text-primary-600 bg-primary-50 dark:bg-primary-500/15" },
  { code: "PFLEGE", label: "Pflege", icon: HeartPulse, color: "text-accent-600 bg-accent-50 dark:bg-accent-500/15" },
  { code: "TRANSPORT", label: "Transport", icon: Truck, color: "text-warning-600 bg-warning-50 dark:bg-warning-500/15" },
  { code: "HANDWERK", label: "Handwerk", icon: Wrench, color: "text-success-600 bg-success-50 dark:bg-success-500/15" },
  { code: "GASTRO", label: "Gastro", icon: UtensilsCrossed, color: "text-warning-600 bg-warning-50 dark:bg-warning-500/15" },
  { code: "BAU", label: "Bau", icon: Building2, color: "text-info-600 bg-info-100 dark:bg-info-500/15" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileApi.me(),
  });
  const jobsQuery = useQuery({
    queryKey: ["jobs", "latest"],
    queryFn: () => jobsApi.search({ page: 0, size: 6 }),
  });
  const recommendationsQuery = useQuery({
    queryKey: ["matching", "recommendations"],
    queryFn: () => matchingApi.recommendations(6),
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => applicationsApi.mine(),
  });
  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-6 text-white shadow-[var(--shadow-lg)] md:p-10">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Guten Tag, {user?.email?.split("@")[0] ?? "Willkommen"}!
        </h1>
        <p className="mt-2 text-primary-100">Hier ist dein Überblick.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <HeroStat count={applicationsQuery.data?.totalElements ?? 0} label="Bewerbungen" />
          <HeroStat count={favoritesQuery.data?.length ?? 0} label="Favoriten" />
          <HeroStat count={jobsQuery.data?.totalElements ?? 0} label="Offene Stellen" />
        </div>
      </section>

      {profileQuery.data && (
        <ProfileCompletenessCard profile={profileQuery.data} />
      )}

      {/* Categories */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-dark-text">Kategorien</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={{ pathname: "/search", query: { category: c.code } }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 transition-colors hover:border-primary-300 dark:border-dark-border dark:bg-dark-card"
            >
              <span className={`flex size-11 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="size-5" />
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-dark-text">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">Empfohlen für dich</h2>
            <Link href="/search" className="text-sm font-semibold text-primary-600 hover:underline">
              Alle anzeigen →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendationsQuery.data.slice(0, 3).map((rec) => (
              <div key={rec.job.id} className="relative">
                <span className="absolute -top-2 end-4 z-10 rounded-full bg-success-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {rec.matchPercent}% Match
                </span>
                <JobCard job={rec.job} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest jobs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">Neueste Angebote</h2>
          <Link href="/search" className="text-sm font-semibold text-primary-600 hover:underline">
            Alle anzeigen →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobsQuery.isLoading && Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
          {jobsQuery.data?.content.slice(0, 6).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isFavorite={favoritesQuery.data?.includes(job.id)}
            />
          ))}
          {jobsQuery.data && jobsQuery.data.content.length === 0 && (
            <Card className="p-8 text-center text-sm text-gray-500 dark:text-dark-muted md:col-span-3">
              Noch keine Stellen verfügbar.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function HeroStat({ count, label }: { count: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
      <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
        <Briefcase className="size-4" />
      </div>
      <div className="mt-2 text-2xl font-bold">{count}</div>
      <div className="text-[11px] text-primary-100">{label}</div>
    </div>
  );
}

// Unused icon import guard for tree-shaking
void GraduationCap;
