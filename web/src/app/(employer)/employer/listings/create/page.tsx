"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import type { JobCategory, JobType, GermanLevel } from "@/lib/types";

const schema = z.object({
  companyId: z.string().uuid("Gültige Firmen-ID nötig"),
  title: z.string().min(3, "Mindestens 3 Zeichen"),
  description: z.string().min(20, "Mindestens 20 Zeichen"),
  requirements: z.string().optional(),
  category: z.enum(["IT", "PFLEGE", "TRANSPORT", "HANDWERK", "GASTRO", "BAU", "SONSTIGE"]),
  type: z.enum(["JOB", "AUSBILDUNG", "STUDIUM", "SPRACHKURS", "PRAKTIKUM"]),
  location: z.string().min(2),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  germanLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

type Values = z.infer<typeof schema>;

export default function CreateListingPage() {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { category: "IT", type: "JOB" } });

  const create = useMutation({
    mutationFn: (v: Values) =>
      jobsApi.search().then(() =>
        fetch("/api/v1/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        }).then((r) => {
          if (!r.ok) throw new Error("Create failed");
          return r.json();
        }),
      ),
    onSuccess: () => {
      toast.success("Stelle erstellt!");
      router.push("/employer/listings");
    },
    onError: (e: { message?: string }) => toast.error(e.message ?? "Fehler"),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900 dark:text-dark-text">
        Neue Stellenanzeige
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((v) => create.mutate(v))} className="grid gap-4 md:grid-cols-2">
            <Labeled label="Firmen-ID" error={form.formState.errors.companyId?.message}>
              <Input {...form.register("companyId")} />
            </Labeled>
            <Labeled label="Standort" error={form.formState.errors.location?.message}>
              <Input {...form.register("location")} placeholder="Berlin" />
            </Labeled>
            <div className="md:col-span-2">
              <Labeled label="Titel" error={form.formState.errors.title?.message}>
                <Input {...form.register("title")} placeholder="Senior Java Entwickler" />
              </Labeled>
            </div>
            <Labeled label="Kategorie">
              <select
                {...form.register("category")}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 dark:border-dark-border dark:bg-dark-card"
              >
                {(["IT", "PFLEGE", "TRANSPORT", "HANDWERK", "GASTRO", "BAU", "SONSTIGE"] as JobCategory[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Art">
              <select
                {...form.register("type")}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 dark:border-dark-border dark:bg-dark-card"
              >
                {(["JOB", "AUSBILDUNG", "STUDIUM", "SPRACHKURS", "PRAKTIKUM"] as JobType[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Gehalt min (€)">
              <Input type="number" {...form.register("salaryMin")} />
            </Labeled>
            <Labeled label="Gehalt max (€)">
              <Input type="number" {...form.register("salaryMax")} />
            </Labeled>
            <Labeled label="Deutsch-Niveau">
              <select
                {...form.register("germanLevel")}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 dark:border-dark-border dark:bg-dark-card"
              >
                <option value="">—</option>
                {(["A1", "A2", "B1", "B2", "C1", "C2"] as GermanLevel[]).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Labeled>
            <div className="md:col-span-2">
              <Labeled label="Beschreibung" error={form.formState.errors.description?.message}>
                <Textarea rows={6} {...form.register("description")} />
              </Labeled>
            </div>
            <div className="md:col-span-2">
              <Labeled label="Anforderungen">
                <Textarea rows={4} {...form.register("requirements")} />
              </Labeled>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Speichern…" : "Stelle veröffentlichen"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Labeled({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-accent-600">{error}</p>}
    </div>
  );
}
