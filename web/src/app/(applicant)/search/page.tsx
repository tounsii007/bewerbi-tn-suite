"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  BookmarkPlus,
  Filter,
  RotateCcw,
  Inbox,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { favoritesApi, jobsApi, savedSearchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import { JobCard, JobCardSkeleton } from "@/components/shared/job-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { cn } from "@/lib/cn";
import type { GermanLevel, JobCategory, JobType } from "@/lib/types";

const CATEGORIES: { code: JobCategory; label: string }[] = [
  { code: "IT", label: "IT" },
  { code: "PFLEGE", label: "Pflege" },
  { code: "TRANSPORT", label: "Transport" },
  { code: "HANDWERK", label: "Handwerk" },
  { code: "GASTRO", label: "Gastro" },
  { code: "BAU", label: "Bau" },
  { code: "SONSTIGE", label: "Sonstige" },
];

const TYPES: { code: JobType; label: string }[] = [
  { code: "JOB", label: "Job" },
  { code: "AUSBILDUNG", label: "Ausbildung" },
  { code: "STUDIUM", label: "Studium" },
  { code: "SPRACHKURS", label: "Sprachkurs" },
  { code: "PRAKTIKUM", label: "Praktikum" },
];

const LEVELS: GermanLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SALARY_BUCKETS = [
  0, 20_000, 30_000, 40_000, 50_000, 60_000, 75_000, 90_000, 120_000,
];

export default function SearchPage() {
  const qc = useQueryClient();
  const toastApiError = useApiErrorToast();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<JobCategory | undefined>();
  const [type, setType] = useState<JobType | undefined>();
  const [location, setLocation] = useState("");
  const [minLevel, setMinLevel] = useState<GermanLevel | undefined>();
  const [salaryMin, setSalaryMin] = useState<number | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);
  const debouncedLocation = useDebouncedValue(location, 300);

  const jobsQuery = useQuery({
    queryKey: [
      "jobs",
      { debouncedQuery, category, type, debouncedLocation, minLevel, salaryMin },
    ],
    queryFn: () =>
      jobsApi.search({
        search: debouncedQuery || undefined,
        category,
        type,
        location: debouncedLocation || undefined,
        minGermanLevel: minLevel,
        salaryMin,
      }),
  });

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
  });

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (debouncedQuery) n++;
    if (category) n++;
    if (type) n++;
    if (debouncedLocation) n++;
    if (minLevel) n++;
    if (salaryMin) n++;
    return n;
  }, [debouncedQuery, category, type, debouncedLocation, minLevel, salaryMin]);

  const clearAll = () => {
    setQuery("");
    setCategory(undefined);
    setType(undefined);
    setLocation("");
    setMinLevel(undefined);
    setSalaryMin(undefined);
  };

  const saveSearch = async () => {
    const parts: string[] = [];
    if (debouncedQuery) parts.push(`"${debouncedQuery}"`);
    if (category) parts.push(category);
    if (type) parts.push(type);
    if (debouncedLocation) parts.push(debouncedLocation);
    const name = parts.length ? parts.join(" · ") : "Alle Stellen";
    try {
      await savedSearchApi.create({
        name,
        query: debouncedQuery || undefined,
        category,
        type,
        location: debouncedLocation || undefined,
        minGermanLevel: minLevel,
        salaryMin,
        alertsEnabled: true,
        alertFrequency: "DAILY",
      });
      toast.success(`„${name}" gespeichert`);
    } catch (e) {
      toastApiError(e, "Aktion fehlgeschlagen");
    }
  };

  const toggleFav = async (jobId: string) => {
    const isFav = favoritesQuery.data?.includes(jobId);
    try {
      if (isFav) await favoritesApi.remove(jobId);
      else await favoritesApi.add(jobId);
      await qc.invalidateQueries({ queryKey: ["favorites"] });
    } catch (e) {
      toastApiError(e, "Aktion fehlgeschlagen");
    }
  };

  const filterPanel = (
    <FilterPanel
      category={category}
      type={type}
      location={location}
      minLevel={minLevel}
      salaryMin={salaryMin}
      setCategory={setCategory}
      setType={setType}
      setLocation={setLocation}
      setMinLevel={setMinLevel}
      setSalaryMin={setSalaryMin}
      onClear={clearAll}
      activeCount={activeFilterCount}
    />
  );

  return (
    <div className="mx-auto max-w-7xl">
      {/* ── Hero search bar ──────────────────────────────────────────── */}
      <Reveal>
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Finde deinen <GradientText variant="brand">nächsten Schritt</GradientText>
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            {jobsQuery.data?.totalElements != null ? (
              <>
                <strong className="text-gray-900 dark:text-dark-text">
                  {jobsQuery.data.totalElements.toLocaleString("de-DE")}
                </strong>{" "}
                Stellen verfügbar — von Berlin bis München.
              </>
            ) : (
              <>Suche durch tausende Stellen deutschlandweit.</>
            )}
          </p>
        </header>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="z. B. Java, Pflege, LKW-Fahrer, Berlin…"
              className="h-12 text-base"
              leadingIcon={<SearchIcon className="size-4" />}
              trailingIcon={
                query ? (
                  <button onClick={() => setQuery("")} aria-label="Eingabe löschen">
                    <X className="size-4" />
                  </button>
                ) : null
              }
            />
          </div>
          <Button
            variant={activeFilterCount > 0 ? "gradient" : "outline"}
            size="lg"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden"
            leadingIcon={<SlidersHorizontal className="size-4" />}
          >
            Filter
            {activeFilterCount > 0 && (
              <span className="ms-1 inline-flex size-5 items-center justify-center rounded-full bg-white/30 text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Desktop filter sidebar (sticky) ─────────────────────── */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        {/* ── Results ──────────────────────────────────────────────── */}
        <section className="lg:col-span-9">
          {/* Results header bar */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-dark-muted">
              {jobsQuery.isLoading
                ? "Lade…"
                : `${jobsQuery.data?.totalElements ?? 0} Ergebnis${
                    (jobsQuery.data?.totalElements ?? 0) === 1 ? "" : "se"
                  }`}
            </span>
            <div className="ms-auto flex items-center gap-3 text-sm">
              {activeFilterCount > 0 && (
                <>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => void saveSearch()}
                    leadingIcon={<BookmarkPlus className="size-4" />}
                  >
                    Suche speichern
                  </Button>
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300"
                  >
                    <RotateCcw className="size-3.5" /> Alle löschen
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <Reveal>
              <ul className="mb-5 flex flex-wrap gap-2">
                {category && (
                  <FilterChip onClear={() => setCategory(undefined)}>
                    {CATEGORIES.find((c) => c.code === category)?.label}
                  </FilterChip>
                )}
                {type && (
                  <FilterChip onClear={() => setType(undefined)}>
                    {TYPES.find((t) => t.code === type)?.label}
                  </FilterChip>
                )}
                {debouncedLocation && (
                  <FilterChip onClear={() => setLocation("")}>
                    {debouncedLocation}
                  </FilterChip>
                )}
                {minLevel && (
                  <FilterChip onClear={() => setMinLevel(undefined)}>
                    Deutsch ≥ {minLevel}
                  </FilterChip>
                )}
                {salaryMin && (
                  <FilterChip onClear={() => setSalaryMin(undefined)}>
                    ≥ {Math.round(salaryMin / 1000)}k €
                  </FilterChip>
                )}
              </ul>
            </Reveal>
          )}

          {/* Job grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {jobsQuery.isLoading &&
              Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            {jobsQuery.data?.content.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favoritesQuery.data?.includes(job.id)}
                onFavorite={() => void toggleFav(job.id)}
              />
            ))}
          </div>

          {/* Empty state */}
          {jobsQuery.data && jobsQuery.data.content.length === 0 && (
            <Reveal>
              <GlassCard strength="default" className="p-12 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-500/15 text-primary-600">
                  <Inbox className="size-8" />
                </div>
                <h3 className="mt-5 text-xl font-bold">Nichts gefunden</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
                  Versuche, einen Filter zu lockern oder einen anderen Suchbegriff.
                </p>
                {activeFilterCount > 0 && (
                  <div className="mt-6 flex justify-center gap-3">
                    <Button variant="outline" onClick={clearAll}>
                      Filter zurücksetzen
                    </Button>
                    <Button asChild variant="gradient" leadingIcon={<Sparkles className="size-4" />}>
                      <Link href="/dashboard">Empfehlungen ansehen</Link>
                    </Button>
                  </div>
                )}
              </GlassCard>
            </Reveal>
          )}
        </section>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter"
        >
          <button
            aria-label="Filter schließen"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-2xl dark:bg-dark-bg-alt">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-bold">
                <Filter className="size-4" />
                Filter
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Schließen"
                className="grid size-9 place-items-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-card"
              >
                <X className="size-5" />
              </button>
            </div>
            {filterPanel}
            <Button
              variant="gradient"
              size="lg"
              className="mt-5 w-full"
              onClick={() => setDrawerOpen(false)}
            >
              {jobsQuery.data?.totalElements ?? 0} Ergebnisse anzeigen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function FilterChip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <li>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
        {children}
        <button
          onClick={onClear}
          aria-label="Filter entfernen"
          className="grid size-4 place-items-center rounded-full text-primary-600 hover:bg-primary-500/20 dark:text-primary-300"
        >
          <X className="size-3" />
        </button>
      </span>
    </li>
  );
}

function FilterPanel({
  category,
  type,
  location,
  minLevel,
  salaryMin,
  setCategory,
  setType,
  setLocation,
  setMinLevel,
  setSalaryMin,
  onClear,
  activeCount,
}: {
  category: JobCategory | undefined;
  type: JobType | undefined;
  location: string;
  minLevel: GermanLevel | undefined;
  salaryMin: number | undefined;
  setCategory: (v: JobCategory | undefined) => void;
  setType: (v: JobType | undefined) => void;
  setLocation: (v: string) => void;
  setMinLevel: (v: GermanLevel | undefined) => void;
  setSalaryMin: (v: number | undefined) => void;
  onClear: () => void;
  activeCount: number;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-dark-text">
          <Filter className="size-4 text-primary-500" />
          Filter
          {activeCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-300"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      <FilterGroup label="Kategorie">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <ChipButton
              key={c.code}
              active={category === c.code}
              onClick={() => setCategory(category === c.code ? undefined : c.code)}
            >
              {c.label}
            </ChipButton>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Art">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <ChipButton
              key={t.code}
              active={type === t.code}
              onClick={() => setType(type === t.code ? undefined : t.code)}
            >
              {t.label}
            </ChipButton>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Standort">
        <Input
          placeholder="z. B. Berlin"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </FilterGroup>

      <FilterGroup label="Mindest-Deutsch-Niveau">
        <div className="grid grid-cols-6 gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setMinLevel(minLevel === l ? undefined : l)}
              aria-pressed={minLevel === l}
              className={cn(
                "h-9 rounded-lg border text-xs font-bold transition-all",
                minLevel === l
                  ? "border-primary-500 bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-muted",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Mindestgehalt (€)">
        <div className="flex flex-wrap gap-1.5">
          <ChipButton
            active={salaryMin === undefined}
            onClick={() => setSalaryMin(undefined)}
          >
            Alle
          </ChipButton>
          {SALARY_BUCKETS.slice(1).map((b) => (
            <ChipButton
              key={b}
              active={salaryMin === b}
              onClick={() => setSalaryMin(salaryMin === b ? undefined : b)}
            >
              ab {Math.round(b / 1000)}k
            </ChipButton>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold transition-all",
        active
          ? "bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]"
          : "bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700 dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-primary-500/20 dark:hover:text-primary-300",
      )}
    >
      {children}
    </button>
  );
}

// keep the unused Badge import valid — referenced by ESLint rule
void Badge;
