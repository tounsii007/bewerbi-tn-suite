"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Heart,
  HeartPulse,
  Monitor,
  Plane,
  Sparkles,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import {
  jobsApi,
  matchingApi,
  profileApi,
  applicationsApi,
  favoritesApi,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { JobCard, JobCardSkeleton } from "@/components/shared/job-card";
import { ProfileCompletenessCard } from "@/components/shared/profile-completeness-card";
import { Card } from "@/components/ui/card";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/ui/reveal";
import { AuroraBackground } from "@/components/ui/aurora-background";
import type { JobCategory } from "@/lib/types";

const CATEGORIES: {
  code: JobCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { code: "IT", label: "IT", icon: Monitor,
    color: "text-primary-600 bg-primary-50 dark:bg-primary-500/15" },
  { code: "PFLEGE", label: "Pflege", icon: HeartPulse,
    color: "text-accent-600 bg-accent-50 dark:bg-accent-500/15" },
  { code: "TRANSPORT", label: "Transport", icon: Truck,
    color: "text-warning-600 bg-warning-50 dark:bg-warning-500/15" },
  { code: "HANDWERK", label: "Handwerk", icon: Wrench,
    color: "text-success-600 bg-success-50 dark:bg-success-500/15" },
  { code: "GASTRO", label: "Gastro", icon: UtensilsCrossed,
    color: "text-warning-600 bg-warning-50 dark:bg-warning-500/15" },
  { code: "BAU", label: "Bau", icon: Building2,
    color: "text-info-600 bg-info-100 dark:bg-info-500/15" },
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

  const firstName =
    profileQuery.data?.firstName ?? user?.email?.split("@")[0] ?? "Willkommen";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* ── Hero greeting + headline stats ─────────────────────────────── */}
      <HeroGreeting
        firstName={firstName}
        appsCount={applicationsQuery.data?.totalElements ?? 0}
        favCount={favoritesQuery.data?.length ?? 0}
        jobsCount={jobsQuery.data?.totalElements ?? 0}
      />

      {/* ── Bento status grid ──────────────────────────────────────────── */}
      <BentoGrid>
        {/* Profile completeness — wide left tile */}
        <BentoCell span={{ md: 12, lg: 6 }} tone="solid" className="overflow-hidden">
          {profileQuery.isLoading ? (
            <div className="grid h-full place-items-center p-6">
              <span className="text-sm text-gray-500 dark:text-dark-muted">
                Lade Profil…
              </span>
            </div>
          ) : profileQuery.data ? (
            <ProfileCompletenessCard profile={profileQuery.data} />
          ) : (
            <EmptyTile
              icon={<Sparkles className="size-5" />}
              title="Profil starten"
              hint="Du hast noch kein Profil — leg's an, dein Match wartet."
              cta={{ label: "Profil anlegen", href: "/profile" }}
            />
          )}
        </BentoCell>

        {/* Applications snapshot */}
        <BentoCell span={{ md: 6, lg: 3 }} tone="gradient" interactive className="p-5">
          <Link href="/applications" className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-primary-500/15 text-primary-600">
                <FileText className="size-5" />
              </div>
              <ArrowRight className="size-4 text-primary-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Bewerbungen
            </p>
            <p className="mt-1 text-4xl font-extrabold leading-none">
              <NumberTicker value={applicationsQuery.data?.totalElements ?? 0} />
            </p>
            <p className="mt-auto pt-3 text-xs text-gray-500 dark:text-dark-muted">
              {applicationsQuery.data && applicationsQuery.data.totalElements > 0
                ? "Letzte Aktivität: heute"
                : "Noch keine — los geht's"}
            </p>
          </Link>
        </BentoCell>

        {/* Favorites snapshot */}
        <BentoCell span={{ md: 6, lg: 3 }} tone="accent" interactive className="p-5">
          <Link href="/favorites" className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-accent-500/15 text-accent-600">
                <Heart className="size-5" />
              </div>
              <ArrowRight className="size-4 text-accent-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Favoriten
            </p>
            <p className="mt-1 text-4xl font-extrabold leading-none">
              <NumberTicker value={favoritesQuery.data?.length ?? 0} />
            </p>
            <p className="mt-auto pt-3 text-xs text-gray-500 dark:text-dark-muted">
              Schnell wieder zugreifen
            </p>
          </Link>
        </BentoCell>

        {/* Anerkennung quick-status */}
        <BentoCell span={{ md: 6, lg: 4 }} tone="glass" interactive className="p-6">
          <Link href="/anerkennung" className="flex h-full flex-col">
            <div className="flex items-start justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-success-500/15 text-success-600">
                <GraduationCap className="size-5" />
              </div>
              <span className="rounded-full bg-warning-500/15 px-2 py-0.5 text-[11px] font-bold text-warning-700 dark:text-warning-500">
                In Bearbeitung
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold">Anerkennung</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Step-by-step zur Gleichwertigkeit deines Abschlusses.
            </p>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-600 dark:text-primary-300">
              Status öffnen <ArrowRight className="size-4" />
            </span>
          </Link>
        </BentoCell>

        {/* Visa status */}
        <BentoCell span={{ md: 6, lg: 4 }} tone="glass" interactive className="p-6">
          <Link href="/visa" className="flex h-full flex-col">
            <div className="flex items-start justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-info-500/15 text-info-600">
                <Plane className="size-5" />
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600 dark:bg-dark-bg dark:text-dark-muted">
                Vorbereitung
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold">Visum-Tracker</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Blaue Karte EU, §18a, Chancenkarte — Checkliste je nach Typ.
            </p>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-600 dark:text-primary-300">
              Visa-Status <ArrowRight className="size-4" />
            </span>
          </Link>
        </BentoCell>

        {/* Match-score / recommendations CTA */}
        <BentoCell
          span={{ md: 12, lg: 4 }}
          tone="dark"
          interactive
          glow="soft"
          className="relative p-6 text-white"
        >
          <div className="absolute inset-0 -z-10 gradient-conic opacity-20 animate-conic-spin [animation-duration:30s]" />
          <Link href="/search" className="flex h-full flex-col">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-300">
              <Sparkles className="size-3.5" />
              KI-Matching
            </div>
            <h3 className="mt-3 text-3xl font-extrabold">
              <NumberTicker
                value={recommendationsQuery.data?.[0]?.matchPercent ?? 0}
                suffix=" %"
              />
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Bester Match heute · {recommendationsQuery.data?.[0]?.job.title ?? "—"}
            </p>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-300">
              Alle Empfehlungen <ArrowRight className="size-4" />
            </span>
          </Link>
        </BentoCell>
      </BentoGrid>

      {/* ── Categories quick-nav ───────────────────────────────────────── */}
      <Reveal>
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight">Kategorien</h2>
            <Link
              href="/search"
              className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300"
            >
              Alle Stellen →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {CATEGORIES.map((c) => (
              <Link
                key={c.code}
                href={{ pathname: "/search", query: { category: c.code } }}
                className="lift flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 transition-colors hover:border-primary-300 dark:border-dark-border dark:bg-dark-card"
              >
                <span className={`flex size-11 items-center justify-center rounded-xl ${c.color}`}>
                  <c.icon className="size-5" />
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-dark-text">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Recommendations ────────────────────────────────────────────── */}
      {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
        <Reveal>
          <section>
            <SectionHeader
              title="Empfohlen für dich"
              hint="Beste Übereinstimmung mit deinem Profil"
              ctaHref="/search"
              ctaLabel="Alle Matches"
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendationsQuery.data.slice(0, 3).map((rec) => (
                <div key={rec.job.id} className="relative">
                  <span className="absolute -top-2 end-4 z-10 flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,var(--color-success-500),var(--color-success-700))] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                    <TrendingUp className="size-3" />
                    {rec.matchPercent}% Match
                  </span>
                  <JobCard job={rec.job} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── Latest jobs ────────────────────────────────────────────────── */}
      <Reveal>
        <section>
          <SectionHeader
            title="Neueste Angebote"
            hint="Frisch reingekommen"
            ctaHref="/search"
            ctaLabel="Alle"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobsQuery.isLoading &&
              Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
            {jobsQuery.data?.content.slice(0, 6).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favoritesQuery.data?.includes(job.id)}
              />
            ))}
            {jobsQuery.data && jobsQuery.data.content.length === 0 && (
              <Card className="p-8 text-center text-sm text-gray-500 dark:text-dark-muted md:col-span-2 xl:col-span-3">
                Noch keine Stellen verfügbar.
              </Card>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Hero greeting — personalized welcome card with aurora background
 * ───────────────────────────────────────────────────────────────────────── */
function HeroGreeting({
  firstName,
  appsCount,
  favCount,
  jobsCount,
}: {
  firstName: string;
  appsCount: number;
  favCount: number;
  jobsCount: number;
}) {
  const hour = new Date().getHours();
  const salutation =
    hour < 5 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <AuroraBackground variant="default" className="rounded-3xl">
      <div className="relative p-6 md:p-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
            {salutation}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {firstName},{" "}
            <GradientText variant="brand">heute geht&apos;s weiter</GradientText>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
            <HeroStat icon={<FileText className="size-4" />} count={appsCount} label="Bewerbungen" />
            <HeroStat icon={<Heart className="size-4" />} count={favCount} label="Favoriten" />
            <HeroStat icon={<Briefcase className="size-4" />} count={jobsCount} label="Offene Stellen" />
          </div>
        </Reveal>
      </div>
    </AuroraBackground>
  );
}

function HeroStat({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  return (
    <GlassCard strength="strong" className="p-4">
      <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-extrabold leading-none text-gray-900 dark:text-dark-text">
        <NumberTicker value={count} />
      </p>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Common helpers
 * ───────────────────────────────────────────────────────────────────────── */
function SectionHeader({
  title,
  hint,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  hint?: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {hint && <p className="text-sm text-gray-500 dark:text-dark-muted">{hint}</p>}
      </div>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300"
      >
        {ctaLabel} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function EmptyTile({
  icon,
  title,
  hint,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="flex h-full flex-col items-start gap-3 p-6">
      <div className="grid size-10 place-items-center rounded-xl bg-primary-500/15 text-primary-600">
        {icon}
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-dark-muted">{hint}</p>
      <Link
        href={cta.href}
        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300"
      >
        {cta.label} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
