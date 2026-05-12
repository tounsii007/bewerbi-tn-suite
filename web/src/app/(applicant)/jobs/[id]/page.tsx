"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { applicationsApi, favoritesApi, jobsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  const job = useQuery({ queryKey: ["jobs", id], queryFn: () => jobsApi.get(id) });
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: () => favoritesApi.list() });

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
      await applicationsApi.apply({ jobId: id, coverLetter: coverLetter || undefined });
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
        <Loader2 className="size-6 animate-spin text-primary-500" />
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

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="size-4" /> Zurück
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info" size="md">{j.type}</Badge>
        <Badge variant="default" size="md">{j.category}</Badge>
        {j.germanLevel && <Badge variant="info" size="md">Deutsch {j.germanLevel}</Badge>}
        {j.premium && <Badge variant="warning" size="md">Premium</Badge>}
      </div>

      <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-dark-text">{j.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-dark-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" /> {j.location}
        </span>
        {(j.salaryMin || j.salaryMax) && (
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="size-4" />
            {[j.salaryMin, j.salaryMax].filter(Boolean).map((n) => `${Math.round((n as number) / 1000)}k`).join(" – ")} {j.salaryCurrency ?? "EUR"}
          </span>
        )}
        {j.germanLevel && (
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="size-4" /> {j.germanLevel}
          </span>
        )}
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-bold">Details</h2>
        <p className="whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-dark-muted">
          {j.description}
        </p>
      </section>

      {j.requirements && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-bold">Anforderungen</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-dark-muted">
            {j.requirements}
          </p>
        </section>
      )}

      {showApply && (
        <Card className="mt-8">
          <CardContent className="p-5">
            <h3 className="mb-3 font-bold">Anschreiben</h3>
            <Textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Warum passt du zu dieser Stelle?"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApply(false)}>
                Abbrechen
              </Button>
              <Button onClick={apply} disabled={applying}>
                {applying ? "Sende…" : "Absenden"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 mt-10 flex gap-3 border-t border-gray-100 bg-white/90 px-4 py-4 backdrop-blur dark:border-dark-border dark:bg-dark-card/90">
        <Button variant="outline" size="lg" onClick={toggleFav}>
          <Heart className={isFav ? "size-4 fill-accent-600 text-accent-600" : "size-4"} />
          {isFav ? "Gespeichert" : "Merken"}
        </Button>
        {!showApply && (
          <Button size="lg" onClick={() => setShowApply(true)} className="flex-1">
            Jetzt bewerben
          </Button>
        )}
      </div>
    </div>
  );
}
