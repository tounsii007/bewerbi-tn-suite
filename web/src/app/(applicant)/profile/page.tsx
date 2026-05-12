"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { profileApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletenessCard } from "@/components/shared/profile-completeness-card";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  desiredProfession: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profile", "me"], queryFn: () => profileApi.me() });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      firstName: q.data?.firstName ?? "",
      lastName: q.data?.lastName ?? "",
      phone: q.data?.phone ?? "",
      city: q.data?.city ?? "",
      country: q.data?.country ?? "",
      bio: q.data?.bio ?? "",
      desiredProfession: q.data?.desiredProfession ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await profileApi.update(values);
      await qc.invalidateQueries({ queryKey: ["profile", "me"] });
      toast.success("Profil gespeichert");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (q.isLoading) return <Skeleton className="h-64" />;
  if (!q.data) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Mein Profil</h1>

      <ProfileCompletenessCard profile={q.data} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Persönliche Daten</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/onboarding">
              <Pencil className="size-4" /> Onboarding
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <Labeled label="Vorname"><Input {...form.register("firstName")} /></Labeled>
            <Labeled label="Nachname"><Input {...form.register("lastName")} /></Labeled>
            <Labeled label="Telefon"><Input {...form.register("phone")} /></Labeled>
            <Labeled label="Stadt"><Input {...form.register("city")} /></Labeled>
            <Labeled label="Land"><Input {...form.register("country")} /></Labeled>
            <Labeled label="Wunschberuf"><Input {...form.register("desiredProfession")} /></Labeled>
            <div className="md:col-span-2">
              <Labeled label="Über mich"><Textarea rows={4} {...form.register("bio")} /></Labeled>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Speichern…" : "Speichern"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {q.data.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kompetenzen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {q.data.skills.map((s) => (
              <Badge key={s} variant="info" size="md">{s}</Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-text">{label}</label>
      {children}
    </div>
  );
}
