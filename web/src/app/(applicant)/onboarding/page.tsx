"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Lightbulb,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { i18nApi, profileApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Reveal } from "@/components/ui/reveal";
import { useLocaleStore } from "@/stores/locale-store";
import type {
  GermanLevel,
  ProfessionSearchResult,
  RecognitionStatus,
} from "@/lib/types";
import { cn } from "@/lib/cn";

const LEVELS: GermanLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_LABEL: Record<GermanLevel, string> = {
  A1: "Anfänger",
  A2: "Grundlagen",
  B1: "Mittelstufe",
  B2: "Fortgeschr.",
  C1: "Fließend",
  C2: "Muttersprachl.",
};
const RECOG_OPTIONS: {
  key: RecognitionStatus;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "NOT_STARTED",
    label: "Noch nicht gestartet",
    hint: "Wir führen dich Schritt für Schritt durch das Verfahren.",
    icon: ChevronRight,
  },
  {
    key: "IN_PROGRESS",
    label: "Antrag läuft",
    hint: "Wir helfen dir, fehlende Unterlagen einzureichen.",
    icon: Sparkles,
  },
  {
    key: "PARTIALLY_RECOGNIZED",
    label: "Teilweise anerkannt",
    hint: "Anpassungs-/Ausgleichsmaßnahmen sind oft die Brücke.",
    icon: ShieldCheck,
  },
  {
    key: "FULLY_RECOGNIZED",
    label: "Voll anerkannt",
    hint: "Top — du kannst sofort als Fachkraft starten.",
    icon: Check,
  },
  {
    key: "NOT_REQUIRED",
    label: "Nicht erforderlich",
    hint: "Bei nicht-reglementierten Berufen entfällt die Anerkennung.",
    icon: ShieldCheck,
  },
];

type Step = "profession" | "level" | "recognition" | "skills" | "done";

const STEP_META: Record<
  Step,
  { title: string; tagline: string; icon: React.ComponentType<{ className?: string }> }
> = {
  profession: {
    title: "Welchen Beruf möchtest du ausüben?",
    tagline: "Wir matchen Stellen, die zu deinem Berufswunsch passen.",
    icon: Briefcase,
  },
  level: {
    title: "Wie gut ist dein Deutsch?",
    tagline: "Wir zeigen dir nur Stellen, deren Sprachniveau du erfüllst.",
    icon: GraduationCap,
  },
  recognition: {
    title: "Wie ist der Stand deiner Anerkennung?",
    tagline: "Wichtig vor allem für reglementierte Berufe.",
    icon: ShieldCheck,
  },
  skills: {
    title: "Deine wichtigsten Kompetenzen",
    tagline: "Skills schärfen das Matching — 3–8 reichen.",
    icon: Lightbulb,
  },
  done: {
    title: "Alles bereit!",
    tagline: "Wir öffnen dein personalisiertes Dashboard.",
    icon: PartyPopper,
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const locale = useLocaleStore((s) => s.locale);

  const [stepIndex, setStepIndex] = useState(0);
  const [profession, setProfession] = useState("");
  const [professionEntry, setProfessionEntry] =
    useState<ProfessionSearchResult | null>(null);
  const [level, setLevel] = useState<GermanLevel | null>(null);
  const [recog, setRecog] = useState<RecognitionStatus | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ProfessionSearchResult[]>([]);

  const steps: Step[] =
    professionEntry?.regulated === false
      ? ["profession", "level", "skills", "done"]
      : ["profession", "level", "recognition", "skills", "done"];
  const current = steps[Math.min(stepIndex, steps.length - 1)]!;
  const total = steps.length - 1;
  const meta = STEP_META[current];
  const Icon = meta.icon;

  const canNext =
    (current === "profession" && profession.trim().length > 1) ||
    (current === "level" && level !== null) ||
    (current === "recognition" && recog !== null) ||
    current === "skills" ||
    current === "done";

  const search = async (q: string) => {
    setProfession(q);
    if (q.trim().length >= 2) {
      try {
        const results = await i18nApi.professions(q, locale);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const pickProfession = (p: ProfessionSearchResult) => {
    setProfession(p.label);
    setProfessionEntry(p);
    if (skills.length === 0) setSkills(p.skills.slice(0, 5));
    setSuggestions([]);
  };

  const addSkill = (v?: string) => {
    const value = (v ?? skillInput).trim();
    if (value && !skills.includes(value)) setSkills([...skills, value]);
    setSkillInput("");
  };

  const submit = useMutation({
    mutationFn: () =>
      profileApi.completeOnboarding({
        desiredProfession: profession.trim(),
        germanLevel: level ?? undefined,
        recognitionStatus: recog ?? undefined,
        skills,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profile", "me"] });
      toast.success("Profil aktualisiert!");
      router.replace("/dashboard");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Fehler beim Speichern"),
  });

  const next = () => {
    if (current === "done") {
      submit.mutate();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const stepLabel = Math.min(stepIndex + 1, total);
  const progressPct = (Math.min(stepIndex, total) / total) * 100;

  return (
    <AuroraBackground variant="default" className="-mx-4 -my-6 min-h-[calc(100vh-2rem)] sm:-mx-6 sm:-my-8">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        {/* Step indicator + progress */}
        <Reveal>
          <div className="mb-8">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-300">
                Schritt {stepLabel} / {total}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-dark-muted">
                {Math.round(progressPct)} % fertig
              </span>
            </div>
            {/* Segmented progress bar — one pill per step */}
            <div className="mt-3 flex gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all duration-500",
                    i < stepIndex
                      ? "bg-[linear-gradient(90deg,var(--color-primary-500),oklch(0.611_0.18_280))]"
                      : i === stepIndex
                        ? "bg-primary-300 dark:bg-primary-500/40"
                        : "bg-gray-200 dark:bg-dark-border",
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Step card */}
        <Reveal key={current}>
          <GlassCard strength="strong" glow="soft" className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
                <Icon className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {current === "done" ? (
                    <>
                      Alles{" "}
                      <GradientText variant="brand">bereit!</GradientText>
                    </>
                  ) : (
                    meta.title
                  )}
                </h1>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-dark-muted">
                  {meta.tagline}
                </p>
              </div>
            </div>

            {/* Step content */}
            <div className="min-h-[280px]">
              {current === "profession" && (
                <div>
                  <Input
                    value={profession}
                    onChange={(e) => void search(e.target.value)}
                    placeholder="z. B. Krankenpfleger, IT-Entwickler, Maurer…"
                    autoFocus
                    className="h-12 text-base"
                  />
                  {suggestions.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s.code}
                          onClick={() => pickProfession(s)}
                          className="press flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:border-dark-border dark:bg-dark-card dark:hover:bg-primary-500/10"
                        >
                          <span className="font-medium">{s.label}</span>
                          {s.regulated && (
                            <Badge variant="warning">reglementiert</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {professionEntry && suggestions.length === 0 && (
                    <Reveal>
                      <div
                        className={cn(
                          "mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm",
                          professionEntry.regulated
                            ? "border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-200"
                            : "border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200",
                        )}
                      >
                        <Sparkles className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="font-bold">
                            {professionEntry.regulated
                              ? "Reglementierter Beruf"
                              : "Nicht reglementiert"}
                          </p>
                          <p className="mt-0.5 text-xs">
                            {professionEntry.regulated
                              ? "Du brauchst eine Anerkennung deiner Qualifikation — wir helfen dir dabei."
                              : "Anerkennung ist optional. Du kannst direkt mit der Jobsuche loslegen."}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  )}
                </div>
              )}

              {current === "level" && (
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      aria-pressed={level === l}
                      className={cn(
                        "press flex aspect-square flex-col items-center justify-center rounded-2xl border-2 text-center transition-all",
                        level === l
                          ? "border-primary-500 bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]"
                          : "border-gray-200 bg-white text-gray-800 hover:border-primary-300 hover:bg-primary-50/40 dark:border-dark-border dark:bg-dark-card dark:text-dark-text",
                      )}
                    >
                      <span className="text-3xl font-extrabold">{l}</span>
                      <span
                        className={cn(
                          "mt-1 text-[11px] font-semibold",
                          level === l ? "opacity-90" : "opacity-60",
                        )}
                      >
                        {LEVEL_LABEL[l]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {current === "recognition" && (
                <div className="space-y-2">
                  {RECOG_OPTIONS.map((o, i) => {
                    const OIcon = o.icon;
                    const active = recog === o.key;
                    return (
                      <Reveal key={o.key} delay={i * 0.04}>
                        <button
                          onClick={() => setRecog(o.key)}
                          aria-pressed={active}
                          className={cn(
                            "press flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                            active
                              ? "border-primary-500 bg-primary-50/80 dark:bg-primary-500/15"
                              : "border-gray-200 bg-white hover:border-primary-300 dark:border-dark-border dark:bg-dark-card",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
                              active
                                ? "bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white"
                                : "bg-gray-100 text-gray-600 dark:bg-dark-bg-alt dark:text-dark-muted",
                            )}
                          >
                            <OIcon className="size-5" />
                          </span>
                          <div className="flex-1">
                            <p
                              className={cn(
                                "text-sm font-bold",
                                active
                                  ? "text-primary-700 dark:text-primary-200"
                                  : "text-gray-900 dark:text-dark-text",
                              )}
                            >
                              {o.label}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-muted">
                              {o.hint}
                            </p>
                          </div>
                          {active && (
                            <Check className="mt-1 size-5 text-primary-600 dark:text-primary-300" />
                          )}
                        </button>
                      </Reveal>
                    );
                  })}
                </div>
              )}

              {current === "skills" && (
                <div>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="React, Altenpflege, LKW-Führerschein… (Enter zum Hinzufügen)"
                    className="h-12 text-base"
                  />
                  {professionEntry && professionEntry.skills.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                        Vorschläge zu {professionEntry.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {professionEntry.skills
                          .filter((s) => !skills.includes(s))
                          .map((s) => (
                            <button key={s} onClick={() => addSkill(s)}>
                              <Badge variant="outline" size="md">
                                + {s}
                              </Badge>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                        Deine Skills · {skills.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <Badge key={s} variant="info" size="md">
                            {s}
                            <button
                              onClick={() =>
                                setSkills(skills.filter((x) => x !== s))
                              }
                              aria-label={`${s} entfernen`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {current === "done" && (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-[linear-gradient(135deg,var(--color-success-500),var(--color-primary-500))] text-white shadow-[var(--shadow-glow)]">
                    <PartyPopper className="size-10" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-dark-muted">
                    Dein Profil ist eingerichtet. Wir zeigen dir gleich Stellen,
                    die zu{" "}
                    <strong className="text-gray-900 dark:text-dark-text">
                      {profession}
                    </strong>
                    {level ? (
                      <>
                        ,{" "}
                        <strong className="text-gray-900 dark:text-dark-text">
                          {level}
                        </strong>{" "}
                        Deutsch
                      </>
                    ) : null}
                    {skills.length > 0 ? (
                      <>
                        {" "}
                        und{" "}
                        <strong className="text-gray-900 dark:text-dark-text">
                          {skills.length} Kompetenzen
                        </strong>
                      </>
                    ) : null}{" "}
                    passen.
                  </p>
                </div>
              )}
            </div>

            {/* Footer with nav buttons */}
            <div className="mt-8 flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-dark-border">
              {stepIndex > 0 && current !== "done" && (
                <Button
                  variant="ghost"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  leadingIcon={<ChevronLeft className="size-4" />}
                >
                  Zurück
                </Button>
              )}
              <Button
                size="lg"
                variant="gradient"
                loading={submit.isPending}
                disabled={!canNext || submit.isPending}
                onClick={next}
                trailingIcon={<ChevronRight className="size-4" />}
                className="ms-auto"
              >
                {current === "done"
                  ? "Zu meinen Empfehlungen"
                  : current === "skills"
                    ? "Abschließen"
                    : "Weiter"}
              </Button>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </AuroraBackground>
  );
}
