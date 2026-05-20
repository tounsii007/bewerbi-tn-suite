"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { applicationsApi, favoritesApi, jobsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { cn } from "@/lib/cn";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  const job = useQuery({ queryKey: ["jobs", id], queryFn: () => jobsApi.get(id) });
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.list(),
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);

  const isFav = favorites.data?.includes(id);

  const toggleFav = async () => {
    try {
      if (isFav) await favoritesApi.remove(id);
      else await favoritesApi.add(id);
      await qc.invalidateQueries({ queryKey: ["favorites"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const apply = async () => {
    setApplying(true);
    try {
      await applicationsApi.apply({
        jobId: id,
        coverLetter: coverLetter || undefined,
      });
      toast.success("Bewerbung erfolgreich gesendet!");
      setShowApply(false);
      setCoverLetter("");
      await qc.invalidateQueries({ queryKey: ["applications", "mine"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  if (job.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!job.data) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-xl font-bold">Stelle nicht gefunden.</h1>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/search">Zur Suche</Link>
        </Button>
      </div>
    );
  }

  const j = job.data;
  const formattedSalary =
    j.salaryMin || j.salaryMax
      ? [j.salaryMin, j.salaryMax]
          .filter(Boolean)
          .map((n) => `${Math.round((n as number) / 1000)}k`)
          .join(" – ") + ` ${j.salaryCurrency ?? "EUR"}`
      : null;

  return (
    <div className="mx-auto max-w-4xl pb-32">
      <Reveal>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
          leadingIcon={<ArrowLeft className="size-4" />}
        >
          Zurück
        </Button>
      </Reveal>

      {/* Hero header on aurora */}
      <Reveal>
        <AuroraBackground variant="default" className="rounded-3xl">
          <div className="relative p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info" size="md">{j.type}</Badge>
              <Badge variant="default" size="md">{j.category}</Badge>
              {j.germanLevel && (
                <Badge variant="info" size="md">
                  Deutsch {j.germanLevel}
                </Badge>
              )}
              {j.premium && (
                <Badge variant="warning" size="md">
                  <Sparkles className="size-3" />
                  Premium
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              {j.title}
            </h1>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700 dark:text-dark-text">
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-primary-500" />
                {j.location}
              </li>
              {formattedSalary && (
                <li className="inline-flex items-center gap-1.5 font-bold text-success-700 dark:text-success-500">
                  <Briefcase className="size-4" />
                  {formattedSalary}
                </li>
              )}
              {j.germanLevel && (
                <li className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-info-600" />
                  Deutsch {j.germanLevel}
                </li>
              )}
              <li className="inline-flex items-center gap-1.5">
                <Calendar className="size-4 text-gray-400" />
                Eingestellt{" "}
                {new Date(j.createdAt).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "short",
                })}
              </li>
              {"companyName" in j && j.companyName ? (
                <li className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 text-gray-400" />
                  {String(j.companyName)}
                </li>
              ) : null}
            </ul>
          </div>
        </AuroraBackground>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold">Beschreibung</h2>
          <GlassCard strength="subtle" className="p-6">
            <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-dark-text">
              {j.description}
            </p>
          </GlassCard>
        </section>
      </Reveal>

      {j.requirements && (
        <Reveal delay={0.15}>
          <section className="mt-6">
            <h2 className="mb-3 text-xl font-bold">Anforderungen</h2>
            <GlassCard strength="subtle" className="p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-dark-text">
                {j.requirements}
              </p>
            </GlassCard>
          </section>
        </Reveal>
      )}

      {showApply && (
        <Reveal>
          <GlassCard strength="strong" glow="soft" className="mt-8 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Deine Bewerbung</h3>
              <button
                onClick={() => setShowApply(false)}
                aria-label="Abbrechen"
                className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card"
              >
                <X className="size-4" />
              </button>
            </div>
            <Textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Warum passt du zu dieser Stelle? (optional)"
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-300">
              <Sparkles className="size-3.5" />
              Tipp: Ein persönliches Anschreiben verdoppelt deine Antwort-Quote.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApply(false)}>
                Abbrechen
              </Button>
              <Button
                variant="gradient"
                onClick={apply}
                loading={applying}
                leadingIcon={<Send className="size-4" />}
              >
                {applying ? "Sende…" : "Bewerbung absenden"}
              </Button>
            </div>
          </GlassCard>
        </Reveal>
      )}

      {/* Sticky bottom action bar with glass treatment */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6">
        <div className="glass-strong mx-auto flex max-w-4xl items-center gap-3 rounded-2xl p-3 shadow-[var(--shadow-xl)]">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleFav}
            aria-pressed={isFav}
            leadingIcon={
              <Heart
                className={cn(
                  "size-4 transition-transform",
                  isFav && "scale-110 fill-accent-600 text-accent-600",
                )}
              />
            }
          >
            {isFav ? "Gespeichert" : "Merken"}
          </Button>
          {!showApply && (
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setShowApply(true)}
              className="flex-1"
              leadingIcon={<Send className="size-4" />}
            >
              Jetzt bewerben
            </Button>
          )}
          <div className="hidden text-xs text-gray-500 dark:text-dark-muted sm:flex sm:items-center sm:gap-1">
            <Clock className="size-3.5" />
            Antwort in &Oslash; 4 Tagen
          </div>
        </div>
      </div>
    </div>
  );
}
