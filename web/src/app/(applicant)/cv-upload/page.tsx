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
} from "lucide-react";
import { toast } from "sonner";
import { documentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CvHints, DocumentSummary } from "@/lib/types";

export default function CvUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [doc, setDoc] = useState<DocumentSummary | null>(null);
  const [hints, setHints] = useState<CvHints | null>(null);

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
    onError: (e: { message?: string }) => toast.error(e.message ?? "Upload fehlgeschlagen"),
  });

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
  };

  const nothingFound =
    hints && !hints.email && !hints.phone && !hints.germanLevel &&
    hints.skills.length === 0 && hints.languages.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="size-6 text-primary-500" />
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">
          Lebenslauf hochladen
        </h1>
      </div>

      {!doc && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-16 transition-colors hover:border-primary-400 dark:border-dark-border dark:bg-dark-card"
        >
          {upload.isPending ? (
            <Loader2 className="mb-3 size-12 animate-spin text-primary-500" />
          ) : (
            <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
              <Upload className="size-7 text-primary-600" />
            </div>
          )}
          <p className="text-lg font-bold text-gray-900 dark:text-dark-text">
            {upload.isPending ? "Analysiere Lebenslauf…" : "PDF auswählen"}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
            Wir extrahieren Text und füllen dein Profil vor
          </p>
          <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onPick} />
        </button>
      )}

      {hints && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">
              Automatisches Ausfüllen
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-500 dark:text-dark-muted">
            Wir haben folgende Angaben im CV erkannt.
          </p>

          {nothingFound ? (
            <Card className="p-8 text-center text-sm text-gray-500 dark:text-dark-muted">
              Keine Daten automatisch erkannt.
            </Card>
          ) : (
            <div className="space-y-3">
              {hints.email && <HintRow icon={<Mail className="size-4" />} label="E-Mail" value={hints.email} />}
              {hints.phone && <HintRow icon={<Phone className="size-4" />} label="Telefon" value={hints.phone} />}
              {hints.germanLevel && (
                <HintRow icon={<Globe className="size-4" />} label="Deutsch-Niveau" value={hints.germanLevel} />
              )}

              {hints.skills.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                      Kompetenzen
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hints.skills.map((s) => (
                        <Badge key={s} variant="info">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {hints.languages.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                      Sprachen
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hints.languages.map((l) => (
                        <Badge key={l} variant="default">{l}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Button size="lg" className="mt-6 w-full">
            <Check className="size-5" /> Alle übernehmen
          </Button>
        </div>
      )}
    </div>
  );
}

function HintRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
            {label}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
