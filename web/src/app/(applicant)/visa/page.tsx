"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  FileCheck2,
  Plane,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { visaApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/ui/reveal";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { cn } from "@/lib/cn";
import type { VisaType } from "@/lib/types";

const VISA_TYPES: {
  code: VisaType;
  label: string;
  tag: string;
  body: string;
  featured?: boolean;
}[] = [
  {
    code: "BLUE_CARD",
    label: "Blaue Karte EU",
    tag: "§ 18b · Akademiker:innen",
    body: "Mindestgehalt 45.300 € (Engpass: 41.041 €). Beste Option für Ingenieure, Ärzte, IT.",
    featured: true,
  },
  {
    code: "SKILLED_WORKER_VOCATIONAL",
    label: "Fachkraft Berufsausbildung",
    tag: "§ 18a",
    body: "Anerkannte Ausbildung + konkretes Jobangebot.",
  },
  {
    code: "SKILLED_WORKER_ACADEMIC",
    label: "Fachkraft akademisch",
    tag: "§ 18b",
    body: "Hochschulabschluss + qualifizierte Beschäftigung. Klassischer Weg.",
  },
  {
    code: "CHANCENKARTE",
    label: "Chancenkarte",
    tag: "§ 20a · Neu seit 2024",
    body: "Punktebasiert — bis zu 1 Jahr Aufenthalt zur Jobsuche.",
  },
  {
    code: "JOB_SEEKER",
    label: "Jobsuchenden-Visum",
    tag: "§ 20",
    body: "6 Monate, um in Deutschland einen Job zu finden.",
  },
  {
    code: "VOCATIONAL_TRAINING",
    label: "Ausbildungsvisum",
    tag: "§ 16a",
    body: "Du startest eine Berufsausbildung in Deutschland.",
  },
  {
    code: "STUDY",
    label: "Studienvisum",
    tag: "§ 16b",
    body: "Studienplatz / Studienkolleg-Zulassung erforderlich.",
  },
  {
    code: "RECOGNITION",
    label: "Anerkennungsvisum",
    tag: "§ 16d",
    body: "Anpassungs-/Ausgleichsmaßnahmen für die berufliche Anerkennung.",
  },
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

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  }

  const c = q.data;

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <header className="mb-8 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-info-500))] text-white shadow-[var(--shadow-glow)]">
            <Plane className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Visum-<GradientText variant="brand">Tracker</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Dein Visumsprozess auf einen Blick — von Botschaftstermin bis Einreise.
            </p>
          </div>
        </header>
      </Reveal>

      {!c && (
        <>
          <Reveal>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-dark-muted">
              Wähle deinen Visa-Typ
            </p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {VISA_TYPES.map((v, i) => {
              const card = (
                <GlassCard
                  strength="default"
                  lift
                  glow={v.featured ? "ring" : "none"}
                  className="flex h-full flex-col p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300">
                      {v.tag}
                    </p>
                    {v.featured && (
                      <span className="rounded-full bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        Premium
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{v.label}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
                    {v.body}
                  </p>
                  <button
                    onClick={() => create.mutate(v.code)}
                    disabled={create.isPending}
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300 disabled:opacity-60"
                  >
                    Diesen Pfad starten <ArrowRight className="size-4" />
                  </button>
                </GlassCard>
              );
              return (
                <Reveal key={v.code} delay={i * 0.04}>
                  {v.featured ? (
                    <AnimatedGradientBorder thickness={1.5} radius={1} className="h-full">
                      {card}
                    </AnimatedGradientBorder>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </div>
        </>
      )}

      {c && (
        <>
          {/* Hero-progress card on aurora */}
          <Reveal>
            <AuroraBackground variant="default" className="mb-8 rounded-3xl">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300">
                      Aktuell
                    </p>
                    <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">
                      {VISA_TYPES.find((v) => v.code === c.visaType)?.label ?? "Visum"}
                    </h2>
                    {c.embassyCity && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-muted">
                        <Building2 className="size-3.5" />
                        Botschaft {c.embassyCity}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-extrabold leading-none">
                      <GradientText variant="brand">
                        <NumberTicker value={c.progressPercent} suffix=" %" />
                      </GradientText>
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                      Fortschritt
                    </p>
                  </div>
                </div>
                <Progress value={c.progressPercent} className="mt-6 h-3" />
                <p className="mt-3 text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {c.requirements.filter((r) => r.required && r.completed).length} /{" "}
                  {c.requirements.filter((r) => r.required).length} Nachweise erbracht
                </p>
              </div>
            </AuroraBackground>
          </Reveal>

          {/* Timeline of requirements */}
          <Reveal>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-primary-500" />
              <h2 className="text-lg font-bold">Nachweise & Schritte</h2>
            </div>
          </Reveal>

          <ol className="relative ms-3 space-y-3 border-s-2 border-dashed border-primary-200 ps-6 dark:border-primary-500/30">
            {c.requirements.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.04}>
                <li className="relative">
                  {/* Timeline dot */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -start-[33px] top-5 grid size-6 place-items-center rounded-full ring-4 transition-colors",
                      r.completed
                        ? "bg-[linear-gradient(135deg,var(--color-success-500),var(--color-success-700))] text-white ring-success-100 dark:ring-success-500/20"
                        : "bg-white text-gray-400 ring-primary-100 dark:bg-dark-card dark:ring-primary-500/20",
                    )}
                  >
                    {r.completed ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>

                  <button
                    onClick={() => toggle.mutate(r.id)}
                    className={cn(
                      "w-full text-left transition-all",
                      "group",
                    )}
                    aria-pressed={r.completed}
                  >
                    <GlassCard
                      strength={r.completed ? "subtle" : "default"}
                      lift
                      className={cn(
                        "p-4",
                        r.completed && "opacity-80",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <FileCheck2
                          className={cn(
                            "mt-0.5 size-5 shrink-0",
                            r.completed
                              ? "text-success-600"
                              : "text-primary-500",
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={cn(
                                "font-bold",
                                r.completed &&
                                  "text-gray-500 line-through dark:text-dark-muted",
                              )}
                            >
                              {r.title}
                            </h3>
                            {!r.required && <Badge size="sm">optional</Badge>}
                          </div>
                          {r.description && (
                            <p
                              className={cn(
                                "mt-1 text-sm",
                                r.completed
                                  ? "text-gray-400 dark:text-dark-muted"
                                  : "text-gray-600 dark:text-dark-muted",
                              )}
                            >
                              {r.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </button>
                </li>
              </Reveal>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
