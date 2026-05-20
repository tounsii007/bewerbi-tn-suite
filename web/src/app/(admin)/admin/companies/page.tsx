"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ShieldCheck, ShieldX, Inbox } from "lucide-react";
import { toast } from "sonner";
import { companiesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";

export default function AdminCompaniesPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: () => companiesApi.list(),
  });

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "VERIFIED" | "REJECTED" }) =>
      fetch(`/api/v1/companies/${id}/verification-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => {
        if (!r.ok) throw new Error("decision failed");
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
      toast.success("Entscheidung gespeichert");
    },
  });

  const pending = q.data?.content.filter(
    (c) => c.verificationStatus === "PENDING_REVIEW",
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <header className="mb-8 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-info-500))] text-white shadow-[var(--shadow-glow)]">
            <Building2 className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Firmen-<GradientText variant="brand">Verifikation</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Anträge prüfen, Handelsregister abgleichen, freischalten.
            </p>
          </div>
        </header>
      </Reveal>

      {q.isLoading && <Skeleton className="h-32 rounded-2xl" />}

      {pending && pending.length === 0 && (
        <Reveal>
          <GlassCard strength="default" className="p-12 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success-500/15 text-success-600">
              <Inbox className="size-8" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Alle Anträge bearbeitet</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
              Aktuell liegen keine Verifizierungs-Anträge zur Prüfung vor.
            </p>
          </GlassCard>
        </Reveal>
      )}

      <div className="space-y-3">
        {pending?.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.04}>
            <GlassCard strength="default" lift className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-warning-500/15 text-warning-600">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-bold">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      {c.slug}
                    </p>
                    <Badge variant="warning" className="mt-1.5">
                      Prüfung läuft
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => decide.mutate({ id: c.id, status: "REJECTED" })}
                    leadingIcon={<ShieldX className="size-4" />}
                  >
                    Ablehnen
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={() => decide.mutate({ id: c.id, status: "VERIFIED" })}
                    leadingIcon={<ShieldCheck className="size-4" />}
                  >
                    Verifizieren
                  </Button>
                </div>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
