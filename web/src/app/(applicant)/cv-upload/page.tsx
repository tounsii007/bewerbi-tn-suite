"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Check,
  FileText,
  Globe,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  Upload,
  X,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { documentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { cn } from "@/lib/cn";
import type { CvHints, DocumentSummary } from "@/lib/types";

export default function CvUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [doc, setDoc] = useState<DocumentSummary | null>(null);
  const [hints, setHints] = useState<CvHints | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const d = await documentsApi.upload(file, "CV");
      const h = await documentsApi.autofill(d.id);
      return { d, h };
    },
    onSuccess: ({ d, h }) => {
      setDoc(d);
      setHints(h);
      toast.success("Lebenslauf analysiert!");
    },
    onError: (e: { message?: string }) =>
      toast.error(e.message ?? "Upload fehlgeschlagen"),
  });

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.includes("pdf")) {
      toast.error("Nur PDF-Dateien werden unterstützt.");
      return;
    }
    if (file.size > 10_000_000) {
      toast.error("Datei zu groß (max. 10 MB).");
      return;
    }
    upload.mutate(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const nothingFound =
    hints &&
    !hints.email &&
    !hints.phone &&
    !hints.germanLevel &&
    hints.skills.length === 0 &&
    hints.languages.length === 0;

  const reset = () => {
    setDoc(null);
    setHints(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
            <FileText className="size-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Lebenslauf{" "}
            <GradientText variant="brand">automatisch übernehmen</GradientText>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600 dark:text-dark-muted">
            Lade dein CV als PDF hoch. Wir extrahieren E-Mail, Telefon,
            Deutsch-Niveau, Skills und Sprachen — du musst nur noch bestätigen.
          </p>
        </header>
      </Reveal>

      {!doc && (
        <Reveal>
          {/* Animated gradient border around the drop zone — the visual
              anchor of this page. The inner area handles drag+drop and
              click-to-pick. */}
          <AnimatedGradientBorder thickness={2} radius={1.5} duration={6}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              aria-label="PDF auswählen oder hierher ziehen"
              aria-busy={upload.isPending}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center transition-all",
                "cursor-pointer focus:outline-none",
                dragOver
                  ? "bg-primary-50/80 scale-[1.005] dark:bg-primary-500/10"
                  : "bg-surface dark:bg-dark-card",
              )}
            >
              {/* Pulsing halo behind the icon when idle */}
              {!upload.isPending && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-1/2 top-12 size-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-primary-500),transparent_60%)] opacity-20 blur-2xl animate-pulse-soft"
                />
              )}

              {upload.isPending ? (
                <>
                  <div className="relative">
                    <Loader2 className="size-16 animate-spin text-primary-500" />
                    <ScanLine className="absolute inset-0 m-auto size-6 text-primary-700 dark:text-primary-300 animate-pulse-soft" />
                  </div>
                  <p className="mt-4 text-lg font-bold">Analysiere Lebenslauf…</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
                    Das dauert nur ein paar Sekunden.
                  </p>
                </>
              ) : (
                <>
                  <div className="relative grid size-20 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
                    <Upload className="size-9" />
                  </div>
                  <p className="mt-6 text-xl font-extrabold">
                    {dragOver ? "Loslassen zum Hochladen" : "PDF hier ablegen oder klicken"}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-dark-muted">
                    PDF, max. 10 MB · DSGVO-konform, EU-Hosting
                  </p>
                  <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-dark-muted">
                    <li className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-success-600" />
                      Privat
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-primary-500" />
                      KI-Auto-Fill
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Globe className="size-3.5 text-accent-500" />
                      Drei Sprachen
                    </li>
                  </ul>
                </>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </AnimatedGradientBorder>
        </Reveal>
      )}

      {hints && doc && (
        <Reveal>
          <div className="mt-8">
            {/* Doc summary header */}
            <GlassCard strength="default" className="mb-6 p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-success-500/15 text-success-600">
                  <Check className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-success-700 dark:text-success-500">
                    Hochgeladen
                  </p>
                  <p className="text-sm font-bold">{doc.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={reset}
                  aria-label="Anderes CV hochladen"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </GlassCard>

            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-primary-500" />
              <h2 className="text-lg font-bold">Auto-Fill — KI-Vorschläge</h2>
            </div>
            <p className="mb-5 text-sm text-gray-500 dark:text-dark-muted">
              Diese Felder haben wir im CV erkannt. Du kannst alles übernehmen
              oder einzeln bearbeiten.
            </p>

            {nothingFound ? (
              <GlassCard strength="default" className="p-8 text-center text-sm text-gray-500 dark:text-dark-muted">
                Keine Daten automatisch erkannt. Du kannst dein Profil manuell
                ausfüllen.
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {hints.email && (
                  <HintRow icon={<Mail className="size-4" />} label="E-Mail" value={hints.email} />
                )}
                {hints.phone && (
                  <HintRow icon={<Phone className="size-4" />} label="Telefon" value={hints.phone} />
                )}
                {hints.germanLevel && (
                  <HintRow
                    icon={<Globe className="size-4" />}
                    label="Deutsch-Niveau"
                    value={hints.germanLevel}
                  />
                )}

                {hints.skills.length > 0 && (
                  <ChipsRow label="Kompetenzen">
                    {hints.skills.map((s) => (
                      <Badge key={s} variant="info">
                        {s}
                      </Badge>
                    ))}
                  </ChipsRow>
                )}
                {hints.languages.length > 0 && (
                  <ChipsRow label="Sprachen">
                    {hints.languages.map((l) => (
                      <Badge key={l} variant="default">
                        {l}
                      </Badge>
                    ))}
                  </ChipsRow>
                )}
              </div>
            )}

            <Button
              size="lg"
              variant="gradient"
              className="mt-6 w-full"
              leadingIcon={<Check className="size-5" />}
            >
              Alle übernehmen
            </Button>
          </div>
        </Reveal>
      )}
    </div>
  );
}

function HintRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <GlassCard strength="subtle" className="flex items-center gap-3 p-4">
      <div className="grid size-10 place-items-center rounded-xl bg-primary-500/15 text-primary-600 dark:text-primary-300">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">
          {value}
        </p>
      </div>
      <span className="text-xs font-semibold text-success-700 dark:text-success-500">
        ✓ Erkannt
      </span>
    </GlassCard>
  );
}

function ChipsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard strength="subtle" className="p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </GlassCard>
  );
}
