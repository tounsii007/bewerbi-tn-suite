"use client";

import { Users, Construction } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <header className="mb-8 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent-500),var(--color-warning-500))] text-white shadow-[var(--shadow-glow)]">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Benutzer<GradientText variant="sunrise">-Verwaltung</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              Konten, Rollen und Sperren.
            </p>
          </div>
        </header>
      </Reveal>

      <Reveal>
        <GlassCard strength="default" className="p-12 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-warning-500/15 text-warning-600">
            <Construction className="size-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold">In Arbeit</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-dark-muted">
            Das User-Management-Backend ist noch nicht freigegeben — diese
            Seite kommt sobald der Endpoint live ist.
          </p>
        </GlassCard>
      </Reveal>
    </div>
  );
}
