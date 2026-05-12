"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { anerkennungApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

type Regulation = "REGULATED" | "NON_REGULATED" | "UNKNOWN";

export default function AnerkennungPage() {
  const qc = useQueryClient();
  const caseQ = useQuery({ queryKey: ["anerkennung", "me"], queryFn: () => anerkennungApi.me() });

  const [profession, setProfession] = useState("");
  const [regulation, setRegulation] = useState<Regulation>("UNKNOWN");

  const create = useMutation({
    mutationFn: () => anerkennungApi.create({ profession: profession.trim(), regulationType: regulation }),
    onSuccess: (d) => qc.setQueryData(["anerkennung", "me"], d),
    onError: (e: { message?: string }) => toast.error(e.message ?? "Fehler"),
  });

  const toggle = useMutation({
    mutationFn: (stepId: string) => anerkennungApi.toggleStep(stepId),
    onSuccess: (d) => qc.setQueryData(["anerkennung", "me"], d),
  });

  if (caseQ.isLoading) return <Skeleton className="h-64" />;
  const c = caseQ.data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <GraduationCap className="size-6 text-primary-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Anerkennung</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Schritt für Schritt zum Anerkennungsbescheid.
          </p>
        </div>
      </div>

      {!c && (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-semibold">Welchen Beruf möchtest du anerkennen lassen?</label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="z. B. Gesundheits- und Krankenpfleger/in"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Ist es ein reglementierter Beruf?</label>
              <div className="space-y-2">
                {(["REGULATED", "NON_REGULATED", "UNKNOWN"] as Regulation[]).map((r) => {
                  const labels: Record<Regulation, { t: string; h: string }> = {
                    REGULATED: { t: "Reglementiert", h: "z. B. Pflege, Ärzte, Lehrer" },
                    NON_REGULATED: { t: "Nicht reglementiert", h: "z. B. IT, Kaufmännisch" },
                    UNKNOWN: { t: "Weiß nicht", h: "" },
                  };
                  return (
                    <button
                      key={r}
                      onClick={() => setRegulation(r)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-colors",
                        regulation === r
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-500/15"
                          : "border-gray-200 bg-white dark:border-dark-border dark:bg-dark-card",
                      )}
                    >
                      <div className="font-semibold text-gray-900 dark:text-dark-text">{labels[r].t}</div>
                      {labels[r].h && <div className="text-xs text-gray-500 dark:text-dark-muted">{labels[r].h}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              size="lg"
              disabled={!profession.trim() || create.isPending}
              onClick={() => create.mutate()}
              className="w-full"
            >
              {create.isPending ? "Erstelle…" : "Jetzt starten"}
            </Button>
          </CardContent>
        </Card>
      )}

      {c && (
        <>
          <Card className="mb-5">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                <Building2 className="me-1 inline size-3.5" /> Zuständige Stelle
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-dark-text">{c.competentAuthority ?? "—"}</p>
              <p className="text-sm text-gray-500 dark:text-dark-muted">{c.profession}</p>
              <Progress
                value={c.progressPercent}
                indicatorClassName="bg-success-500"
                className="mt-4"
              />
              <p className="mt-2 text-xs font-bold text-success-700">
                {c.progressPercent}% abgeschlossen
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {c.steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => toggle.mutate(s.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  s.completed
                    ? "border-success-500 bg-success-50 dark:bg-success-500/15"
                    : "border-gray-200 bg-white hover:border-primary-300 dark:border-dark-border dark:bg-dark-card",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    s.completed ? "bg-success-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-dark-border",
                  )}
                >
                  {s.completed ? <Check className="size-4" /> : i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-dark-text">{s.title}</h3>
                  {s.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">{s.description}</p>
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
