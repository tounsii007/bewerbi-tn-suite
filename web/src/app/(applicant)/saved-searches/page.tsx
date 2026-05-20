"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, BookmarkPlus, Trash2, Search } from "lucide-react";
import { savedSearchApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import type { AlertFrequency, SavedSearch } from "@/lib/types";

const FREQ_LABEL: Record<AlertFrequency, string> = {
  INSTANT: "Sofort",
  DAILY: "Täglich",
  WEEKLY: "Wöchentlich",
  OFF: "Aus",
};

export default function SavedSearchesPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["saved-searches"],
    queryFn: () => savedSearchApi.list(),
  });

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
      <Reveal>
        <header className="mb-8 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-info-500))] text-white shadow-[var(--shadow-glow)]">
            <BookmarkPlus className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Gespeicherte <GradientText variant="brand">Suchen</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Filter merken, Alerts aktivieren — verpasse keine neue Stelle.
            </p>
          </div>
        </header>
      </Reveal>

      {q.isLoading && <Skeleton className="h-32 rounded-2xl" />}

      {q.data && q.data.length === 0 && (
        <Reveal>
          <GlassCard strength="default" className="p-12 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-500/15 text-primary-600">
              <BookmarkPlus className="size-8" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Noch keine Suchen gespeichert</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-dark-muted">
              Stelle in /search deine Filter ein und klicke auf &bdquo;Suche
              speichern&ldquo; — die kommen dann hierher mit Alerts.
            </p>
            <Button
              asChild
              variant="gradient"
              size="lg"
              className="mt-6"
              leadingIcon={<Search className="size-4" />}
            >
              <Link href="/search">Zur Suche</Link>
            </Button>
          </GlassCard>
        </Reveal>
      )}

      <div className="space-y-3">
        {q.data?.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <GlassCard strength="default" lift className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={{ pathname: "/search", query: { q: s.query ?? "" } }}
                  className="flex flex-1 items-center gap-3"
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-primary-500/15 text-primary-600">
                    <Search className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-dark-text">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-muted">
                      Gespeichert am{" "}
                      {new Date(s.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFreq.mutate(s)}
                    aria-pressed={s.alertFrequency !== "OFF"}
                    className={
                      "press inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors " +
                      (s.alertFrequency === "OFF"
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-bg dark:text-dark-muted"
                        : "bg-primary-500/15 text-primary-700 hover:bg-primary-500/25 dark:text-primary-300")
                    }
                  >
                    {s.alertFrequency === "OFF" ? (
                      <>
                        <BellOff className="size-3.5" />
                        Aus
                      </>
                    ) : (
                      <>
                        <Bell className="size-3.5" />
                        {FREQ_LABEL[s.alertFrequency]}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => remove.mutate(s.id)}
                    aria-label="Suche löschen"
                    className="press grid size-8 place-items-center rounded-full text-gray-400 hover:bg-accent-500/15 hover:text-accent-600 dark:text-dark-muted"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
