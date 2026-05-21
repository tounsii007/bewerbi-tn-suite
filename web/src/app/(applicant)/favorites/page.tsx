"use client";

import Link from "next/link";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Search } from "lucide-react";
import { favoritesApi, jobsApi } from "@/lib/api";
import { JobCard, JobCardSkeleton } from "@/components/shared/job-card";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { useTranslate } from "@/i18n/use-translate";

export default function FavoritesPage() {
  const qc = useQueryClient();
  const toastApiError = useApiErrorToast();
  const t = useTranslate();
  const favIds = useQuery({ queryKey: ["favorites"], queryFn: () => favoritesApi.list() });
  const jobs = useQueries({
    queries: (favIds.data ?? []).map((id) => ({
      queryKey: ["jobs", id],
      queryFn: () => jobsApi.get(id),
    })),
  });

  const items = jobs.map((q) => q.data).filter(Boolean);
  const stillLoading = favIds.isLoading || jobs.some((j) => j.isLoading);

  const remove = async (jobId: string) => {
    try {
      await favoritesApi.remove(jobId);
      await qc.invalidateQueries({ queryKey: ["favorites"] });
    } catch (e) {
      toastApiError(e, "Entfernen fehlgeschlagen");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <header className="mb-8 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent-500),var(--color-warning-500))] text-white shadow-[var(--shadow-glow)]">
            <Heart className="size-6 fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              <GradientText variant="sunrise">Favoriten</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              {items.length > 0
                ? `${items.length} gespeicherte Stelle${items.length === 1 ? "" : "n"} — schnell wieder zugreifen.`
                : "Markiere Stellen als Favorit, um sie hier wiederzufinden."}
            </p>
          </div>
        </header>
      </Reveal>

      {stillLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!stillLoading && items.length === 0 && (
        <Reveal>
          <GlassCard strength="default" className="p-12 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-500/15 text-accent-600">
              <Heart className="size-8" />
            </div>
            <h2 className="mt-5 text-xl font-bold">{t("empty.noFav.title")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-dark-muted">
              {t("empty.noFav.body")}
            </p>
            <Button
              asChild
              variant="gradient"
              size="lg"
              className="mt-6"
              leadingIcon={<Search className="size-4" />}
            >
              <Link href="/search">Stellen entdecken</Link>
            </Button>
          </GlassCard>
        </Reveal>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((j) =>
          j ? (
            <JobCard
              key={j.id}
              job={j}
              isFavorite
              onFavorite={() => void remove(j.id)}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
