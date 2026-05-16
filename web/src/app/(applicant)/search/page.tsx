"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search as SearchIcon, SlidersHorizontal, X, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { favoritesApi, jobsApi, savedSearchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobCard, JobCardSkeleton } from "@/components/shared/job-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
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

const SALARY_BUCKETS = [0, 20_000, 30_000, 40_000, 50_000, 60_000, 75_000, 90_000, 120_000];

export default function SearchPage() {
  const qc = useQueryClient();
  const toastApiError = useApiErrorToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<JobCategory | undefined>();
  const [type, setType] = useState<JobType | undefined>();
  const [location, setLocation] = useState("");
  const [minLevel, setMinLevel] = useState<GermanLevel | undefined>();
  const [salaryMin, setSalaryMin] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);
  const debouncedLocation = useDebouncedValue(location, 300);

  const jobsQuery = useQuery({
    queryKey: ["jobs", { debouncedQuery, category, type, debouncedLocation, minLevel, salaryMin }],
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

  const favoritesQuery = useQuery({ queryKey: ["favorites"], queryFn: () => favoritesApi.list() });

  const hasActiveFilters = useMemo(
    () => !!(debouncedQuery || category || type || debouncedLocation || minLevel || salaryMin),
    [debouncedQuery, category, type, debouncedLocation, minLevel, salaryMin],
  );

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Stellen suchen</h1>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="z. B. Java, Pflege, LKW-Fahrer"
            leadingIcon={<SearchIcon className="size-4" />}
            trailingIcon={
              query ? (
                <button onClick={() => setQuery("")} aria-label="clear">
                  <X className="size-4" />
                </button>
              ) : null
            }
          />
        </div>
        <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="size-4" /> Filter
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-dark-muted">
          {jobsQuery.data?.totalElements ?? 0} Ergebnisse
        </span>
        <div className="flex gap-4">
          {hasActiveFilters && (
            <>
              <button onClick={saveSearch} className="flex items-center gap-1 font-semibold text-primary-600 hover:underline">
                <BookmarkPlus className="size-4" /> Suche speichern
              </button>
              <button onClick={clearAll} className="font-semibold text-primary-600 hover:underline">
                Alle löschen
              </button>
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 dark:border-dark-border dark:bg-dark-card">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Kategorie
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCategory(category === c.code ? undefined : c.code)}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Badge variant={category === c.code ? "info" : "default"} size="md">
                    {c.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Art
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.code}
                  onClick={() => setType(type === t.code ? undefined : t.code)}
                  className="transition-transform hover:scale-[1.02]"
                >
                  <Badge variant={type === t.code ? "info" : "default"} size="md">
                    {t.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                Standort
              </p>
              <Input
                placeholder="z. B. Berlin"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                Mindest-Deutsch-Niveau
              </p>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setMinLevel(minLevel === l ? undefined : l)}
                    className={`size-10 rounded-lg border font-bold ${
                      minLevel === l
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 dark:border-dark-border dark:text-dark-muted"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Mindestgehalt (€)
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSalaryMin(undefined)}>
                <Badge variant={salaryMin === undefined ? "info" : "default"} size="md">
                  Alle
                </Badge>
              </button>
              {SALARY_BUCKETS.slice(1).map((b) => (
                <button key={b} onClick={() => setSalaryMin(salaryMin === b ? undefined : b)}>
                  <Badge variant={salaryMin === b ? "info" : "default"} size="md">
                    ab {Math.round(b / 1000)}k
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobsQuery.isLoading && Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        {jobsQuery.data?.content.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isFavorite={favoritesQuery.data?.includes(job.id)}
            onFavorite={() => void toggleFav(job.id)}
          />
        ))}
        {jobsQuery.data && jobsQuery.data.content.length === 0 && (
          <div className="col-span-full rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500 dark:border-dark-border dark:bg-dark-card dark:text-dark-muted">
            Keine Ergebnisse gefunden. Versuche andere Suchbegriffe.
          </div>
        )}
      </div>
    </div>
  );
}
