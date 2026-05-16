"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesApi, jobsApi } from "@/lib/api";
import { JobCard } from "@/components/shared/job-card";
import { Card } from "@/components/ui/card";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";

export default function FavoritesPage() {
  const qc = useQueryClient();
  const toastApiError = useApiErrorToast();
  const favIds = useQuery({ queryKey: ["favorites"], queryFn: () => favoritesApi.list() });
  const jobs = useQueries({
    queries: (favIds.data ?? []).map((id) => ({
      queryKey: ["jobs", id],
      queryFn: () => jobsApi.get(id),
    })),
  });

  const items = jobs.map((q) => q.data).filter(Boolean);

  const remove = async (jobId: string) => {
    try {
      await favoritesApi.remove(jobId);
      await qc.invalidateQueries({ queryKey: ["favorites"] });
    } catch (e) {
      toastApiError(e, "Entfernen fehlgeschlagen");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900 dark:text-dark-text">Favoriten</h1>

      {items.length === 0 && !favIds.isLoading && (
        <Card className="p-12 text-center text-sm text-gray-500 dark:text-dark-muted">
          Du hast noch keine Favoriten.
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((j) =>
          j ? <JobCard key={j.id} job={j} isFavorite onFavorite={() => void remove(j.id)} /> : null,
        )}
      </div>
    </div>
  );
}
