"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, FileCheck2, Plane } from "lucide-react";
import { toast } from "sonner";
import { visaApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { VisaType } from "@/lib/types";
import { cn } from "@/lib/cn";

const VISA_TYPES: { code: VisaType; label: string }[] = [
  { code: "BLUE_CARD", label: "Blaue Karte EU (§18b)" },
  { code: "SKILLED_WORKER_VOCATIONAL", label: "Fachkraft Berufsausbildung (§18a)" },
  { code: "SKILLED_WORKER_ACADEMIC", label: "Fachkraft akademisch (§18b)" },
  { code: "VOCATIONAL_TRAINING", label: "Ausbildungsvisum (§16a)" },
  { code: "STUDY", label: "Studienvisum (§16b)" },
  { code: "JOB_SEEKER", label: "Jobsuche (§20)" },
  { code: "RECOGNITION", label: "Anerkennung (§16d)" },
  { code: "CHANCENKARTE", label: "Chancenkarte (§20a)" },
];

export default function VisaPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["visa", "me"], queryFn: () => visaApi.me() });

  const create = useMutation({
    mutationFn: (visaType: VisaType) => visaApi.create({ visaType }),
    onSuccess: (d) => qc.setQueryData(["visa", "me"], d),
    onError: (e: { message?: string }) => toast.error(e.message ?? "Fehler"),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => visaApi.toggleRequirement(id),
    onSuccess: (d) => qc.setQueryData(["visa", "me"], d),
  });

  if (q.isLoading) return <Skeleton className="h-64" />;
  const c = q.data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Plane className="size-6 text-primary-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Visum-Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted">Dein Visumsprozess im Überblick.</p>
        </div>
      </div>

      {!c && (
        <div className="space-y-2">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
            Welches Visum brauchst du?
          </p>
          {VISA_TYPES.map((v) => (
            <button
              key={v.code}
              onClick={() => create.mutate(v.code)}
              disabled={create.isPending}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left font-bold text-gray-900 transition-colors hover:border-primary-300 dark:border-dark-border dark:bg-dark-card dark:text-dark-text"
            >
              {v.label}
              <Badge variant="info">Starten</Badge>
            </button>
          ))}
        </div>
      )}

      {c && (
        <>
          <Card className="mb-5">
            <CardContent className="p-5">
              <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                {VISA_TYPES.find((v) => v.code === c.visaType)?.label}
              </p>
              {c.embassyCity && (
                <p className="mt-2 inline-flex items-center gap-1 text-sm text-gray-500 dark:text-dark-muted">
                  <Building2 className="size-3.5" /> {c.embassyCity}
                </p>
              )}
              <Progress value={c.progressPercent} className="mt-4" />
              <p className="mt-2 text-xs font-bold text-primary-600">
                {c.requirements.filter((r) => r.required && r.completed).length} /{" "}
                {c.requirements.filter((r) => r.required).length} Nachweise erbracht
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {c.requirements.map((r) => (
              <button
                key={r.id}
                onClick={() => toggle.mutate(r.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  r.completed
                    ? "border-success-500 bg-success-50 dark:bg-success-500/15"
                    : r.required
                      ? "border-gray-200 bg-white hover:border-primary-300 dark:border-dark-border dark:bg-dark-card"
                      : "border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-dark-bg",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full",
                    r.completed ? "bg-success-500 text-white" : "bg-gray-100 text-gray-400 dark:bg-dark-border",
                  )}
                >
                  {r.completed ? <Check className="size-4" /> : <FileCheck2 className="size-3.5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-dark-text">{r.title}</h3>
                    {!r.required && <Badge size="sm">optional</Badge>}
                  </div>
                  {r.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">{r.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
