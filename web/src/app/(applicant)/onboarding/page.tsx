"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { i18nApi, profileApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocaleStore } from "@/stores/locale-store";
import type { GermanLevel, ProfessionSearchResult, RecognitionStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const LEVELS: GermanLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const RECOG_OPTIONS: { key: RecognitionStatus; label: string }[] = [
  { key: "NOT_STARTED", label: "Noch nicht gestartet" },
  { key: "IN_PROGRESS", label: "Antrag läuft" },
  { key: "PARTIALLY_RECOGNIZED", label: "Teilweise anerkannt" },
  { key: "FULLY_RECOGNIZED", label: "Voll anerkannt" },
  { key: "NOT_REQUIRED", label: "Nicht erforderlich" },
];

type Step = "profession" | "level" | "recognition" | "skills" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const locale = useLocaleStore((s) => s.locale);

  const [stepIndex, setStepIndex] = useState(0);
  const [profession, setProfession] = useState("");
  const [professionEntry, setProfessionEntry] = useState<ProfessionSearchResult | null>(null);
  const [level, setLevel] = useState<GermanLevel | null>(null);
  const [recog, setRecog] = useState<RecognitionStatus | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ProfessionSearchResult[]>([]);

  const steps: Step[] =
    professionEntry?.regulated === false
      ? ["profession", "level", "skills", "done"]
      : ["profession", "level", "recognition", "skills", "done"];
  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const total = steps.length - 1;

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
    onError: (e: { message?: string }) => toast.error(e.message ?? "Fehler beim Speichern"),
  });

  const next = () => {
    if (current === "done") {
      submit.mutate();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Willkommen bei bewerbi.tn</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
          In {total} kurzen Schritten zu passenden Stellen.
        </p>
        <Progress value={(Math.min(stepIndex, total) / total) * 100} className="mt-4" />
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-dark-muted">
          Schritt {Math.min(stepIndex + 1, total)} / {total}
        </p>
      </div>

      {current === "profession" && (
        <div>
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-dark-text">
            Welchen Beruf möchtest du ausüben?
          </h2>
          <Input
            value={profession}
            onChange={(e) => void search(e.target.value)}
            placeholder="z. B. Krankenpfleger, IT-Entwickler"
            autoFocus
          />
          {suggestions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.code}
                  onClick={() => pickProfession(s)}
                  className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-dark-border"
                >
                  <span className="text-gray-800 dark:text-dark-text">{s.label}</span>
                  {s.regulated && <Badge variant="warning">reglementiert</Badge>}
                </button>
              ))}
            </div>
          )}
          {professionEntry && (
            <div
              className={cn(
                "mt-3 flex items-start gap-2 rounded-xl p-3 text-xs",
                professionEntry.regulated
                  ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15"
                  : "bg-primary-50 text-primary-700 dark:bg-primary-500/15",
              )}
            >
              <Sparkles className="size-4 shrink-0" />
              <span>
                {professionEntry.regulated
                  ? "Reglementierter Beruf — Anerkennung zwingend nötig."
                  : "Nicht reglementiert — Anerkennung ist optional."}
              </span>
            </div>
          )}
        </div>
      )}

      {current === "level" && (
        <div>
          <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-dark-text">
            Wie gut ist dein Deutsch?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-2xl border-2 text-center transition-transform hover:scale-105",
                  level === l
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-gray-200 bg-white text-gray-800 dark:border-dark-border dark:bg-dark-card dark:text-dark-text",
                )}
              >
                <span className="text-3xl font-extrabold">{l}</span>
                <span className="mt-1 text-[11px] opacity-75">
                  {l.startsWith("A") ? "Anfänger" : l.startsWith("B") ? "Fortgeschr." : "Fließend"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {current === "recognition" && (
        <div>
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-dark-text">
            Wie ist der Stand deiner Anerkennung?
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-dark-muted">
            Wichtig vor allem für reglementierte Berufe.
          </p>
          <div className="space-y-2">
            {RECOG_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setRecog(o.key)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-colors",
                  recog === o.key
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/15"
                    : "border-gray-200 bg-white text-gray-800 dark:border-dark-border dark:bg-dark-card dark:text-dark-text",
                )}
              >
                <span>{o.label}</span>
                {recog === o.key && <Check className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {current === "skills" && (
        <div>
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-dark-text">
            Deine wichtigsten Kompetenzen
          </h2>
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="React, Altenpflege, LKW-Führerschein…"
          />
          {professionEntry && professionEntry.skills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                Vorschläge
              </p>
              <div className="flex flex-wrap gap-2">
                {professionEntry.skills
                  .filter((s) => !skills.includes(s))
                  .map((s) => (
                    <button key={s} onClick={() => addSkill(s)}>
                      <Badge variant="outline" size="md">+ {s}</Badge>
                    </button>
                  ))}
              </div>
            </div>
          )}
          {skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="info" size="md">
                  {s}
                  <button onClick={() => setSkills(skills.filter((x) => x !== s))}>
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {current === "done" && (
        <div className="py-8 text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">
            Super! Deine Empfehlungen sind bereit.
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-dark-muted">
            Wir zeigen dir Stellen, die zu <b>{profession}</b>, <b>{level}</b> Deutsch
            {skills.length > 0 ? ` und ${skills.length} Kompetenzen` : ""} passen.
          </p>
        </div>
      )}

      <div className="mt-8 flex gap-3 border-t border-gray-100 pt-6 dark:border-dark-border">
        {stepIndex > 0 && current !== "done" && (
          <Button variant="ghost" onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>
            <ChevronLeft className="size-4" /> Zurück
          </Button>
        )}
        <Button
          size="lg"
          disabled={!canNext || submit.isPending}
          onClick={next}
          className="ms-auto"
        >
          {current === "done"
            ? submit.isPending
              ? "Speichern…"
              : "Zu meinen Empfehlungen"
            : current === "skills"
              ? "Abschließen"
              : "Weiter"}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
