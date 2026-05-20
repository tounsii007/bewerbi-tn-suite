"use client";

import Link from "next/link";
import { Briefcase, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";

export default function EmployerListingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Meine <GradientText variant="brand">Anzeigen</GradientText>
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
              Alle aktiven und archivierten Stellen auf einen Blick.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="gradient"
            leadingIcon={<Plus className="size-4" />}
          >
            <Link href="/employer/listings/create">Neue Stelle</Link>
          </Button>
        </header>
      </Reveal>

      <Reveal>
        <GlassCard strength="default" className="p-12 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-500/15 text-primary-600">
            <Briefcase className="size-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Noch keine Stellenanzeigen</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-dark-muted">
            Veröffentliche deine erste Stelle in 3 Minuten — unser Editor führt
            dich durch alle Pflichtfelder.
          </p>
          <Button
            asChild
            size="lg"
            variant="gradient"
            className="mt-6"
            leadingIcon={<Sparkles className="size-4" />}
          >
            <Link href="/employer/listings/create">Erste Stelle anlegen</Link>
          </Button>
        </GlassCard>
      </Reveal>
    </div>
  );
}
