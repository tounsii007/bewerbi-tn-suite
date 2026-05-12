"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, BookmarkPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { savedSearchApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertFrequency, SavedSearch } from "@/lib/types";

const FREQ_LABEL: Record<AlertFrequency, string> = {
  INSTANT: "Sofort",
  DAILY: "Täglich",
  WEEKLY: "Wöchentlich",
  OFF: "Aus",
};

export default function SavedSearchesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["saved-searches"], queryFn: () => savedSearchApi.list() });

  const remove = useMutation({
    mutationFn: (id: string) => savedSearchApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-searches"] }),
  });

  const toggleFreq = useMutation({
    mutationFn: (s: SavedSearch) =>
      savedSearchApi.update(s.id, {
        ...s,
        alertsEnabled: s.alertFrequency === "OFF",
        alertFrequency: s.alertFrequency === "OFF" ? "DAILY" : "OFF",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-searches"] }),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900 dark:text-dark-text">
        Gespeicherte Suchen
      </h1>

      {q.isLoading && <Skeleton className="h-32" />}

      {q.data && q.data.length === 0 && (
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <BookmarkPlus className="size-10 text-gray-300" />
          <p className="text-sm text-gray-500 dark:text-dark-muted">Noch keine gespeicherten Suchen</p>
          <Link href="/search" className="text-sm font-semibold text-primary-600 hover:underline">
            Zur Suche →
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {q.data?.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <Link href={{ pathname: "/search", query: { q: s.query ?? "" } }} className="flex-1">
                <p className="font-bold text-gray-900 dark:text-dark-text">{s.name}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-muted">
                  {new Date(s.createdAt).toLocaleDateString("de-DE")}
                </p>
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFreq.mutate(s)}
                  className="flex items-center gap-1 text-xs font-semibold"
                >
                  {s.alertFrequency === "OFF" ? (
                    <>
                      <BellOff className="size-3.5 text-gray-400" />
                      <span className="text-gray-500">Aus</span>
                    </>
                  ) : (
                    <>
                      <Bell className="size-3.5 text-primary-600" />
                      <span className="text-primary-600">{FREQ_LABEL[s.alertFrequency]}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => remove.mutate(s.id)}
                  className="text-xs font-semibold text-accent-600 hover:underline"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
