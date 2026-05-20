"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Eye,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { GradientText } from "@/components/ui/gradient-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/ui/reveal";
import { AuroraBackground } from "@/components/ui/aurora-background";

/**
 * Iter 123 — employer dashboard.
 *
 * Bento with hero greeting, KPI tiles, recent applications snapshot, and
 * an inline "post a job" CTA. Stats are placeholders until the analytics
 * endpoint lands (mirrors the applicant dashboard structure for
 * consistency).
 */
export default function EmployerDashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <AuroraBackground variant="default" className="rounded-3xl">
        <div className="relative p-6 md:p-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                  Employer-Cockpit
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">
                  Talent finden,{" "}
                  <GradientText variant="brand">die bleibt</GradientText>
                </h1>
                <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-dark-muted">
                  Veröffentliche eine Stelle in 3 Minuten — wir matchen
                  vorqualifizierte Bewerber aus Tunesien.
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
            </div>
          </Reveal>
        </div>
      </AuroraBackground>

      <BentoGrid>
        <KpiTile
          icon={<Briefcase className="size-5" />}
          label="Aktive Stellen"
          value={0}
          tone="gradient"
          color="text-primary-600 bg-primary-500/15"
          href="/employer/listings"
        />
        <KpiTile
          icon={<Users className="size-5" />}
          label="Bewerbungen"
          value={0}
          tone="accent"
          color="text-accent-600 bg-accent-500/15"
          href="/employer/applications"
        />
        <KpiTile
          icon={<Eye className="size-5" />}
          label="Aufrufe (30 T.)"
          value={0}
          tone="glass"
          color="text-info-600 bg-info-500/15"
        />
        <KpiTile
          icon={<TrendingUp className="size-5" />}
          label="Match-Quote"
          value={0}
          suffix=" %"
          tone="solid"
          color="text-success-600 bg-success-500/15"
        />

        {/* Pro-Tip tile */}
        <BentoCell
          span={{ md: 12, lg: 8 }}
          tone="dark"
          glow="soft"
          className="relative overflow-hidden p-8 text-white"
        >
          <div className="absolute inset-0 -z-10 gradient-conic opacity-20 animate-conic-spin [animation-duration:30s]" />
          <Reveal>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-300">
              <Sparkles className="size-3.5" />
              Pro-Tipp
            </div>
            <h3 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">
              Stellen mit <GradientText variant="aurora">3 Sprach-Optionen</GradientText>{" "}
              bekommen <span className="text-primary-300">2,4× mehr</span> Bewerbungen.
            </h3>
            <p className="mt-3 text-sm text-white/80">
              Aktiviere FR und AR zusätzlich zu DE — wir übersetzen automatisch,
              dein Recruiter sieht das Original.
            </p>
            <Button
              asChild
              size="md"
              variant="glass"
              className="mt-6 w-fit text-white"
              trailingIcon={<ArrowRight className="size-4" />}
            >
              <Link href="/employer/listings/create">Jetzt nutzen</Link>
            </Button>
          </Reveal>
        </BentoCell>

        {/* Quick links */}
        <BentoCell span={{ md: 12, lg: 4 }} tone="glass" className="p-6">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Schnellzugriff
            </p>
            <ul className="mt-4 space-y-2">
              <QuickLink href="/employer/listings/create" icon={<Plus className="size-4" />}>
                Neue Stelle
              </QuickLink>
              <QuickLink href="/employer/listings" icon={<Briefcase className="size-4" />}>
                Alle Anzeigen
              </QuickLink>
              <QuickLink href="/company" icon={<Building2 className="size-4" />}>
                Firmenprofil
              </QuickLink>
            </ul>
          </Reveal>
        </BentoCell>
      </BentoGrid>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  suffix,
  tone,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone: "gradient" | "accent" | "glass" | "solid";
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="flex h-full flex-col p-5">
      <div className={`grid size-10 place-items-center rounded-xl ${color}`}>
        {icon}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className="mt-1 text-4xl font-extrabold leading-none">
        <NumberTicker value={value} suffix={suffix} />
      </p>
      {href && (
        <p className="mt-auto pt-3 text-xs font-semibold text-primary-600 dark:text-primary-300">
          Details öffnen →
        </p>
      )}
    </div>
  );
  return (
    <BentoCell
      span={{ md: 6, lg: 3 }}
      tone={tone}
      interactive={!!href}
      className="overflow-hidden"
    >
      {href ? <Link href={href} className="block h-full">{inner}</Link> : inner}
    </BentoCell>
  );
}

function QuickLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-dark-text dark:hover:bg-primary-500/15"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-primary-500/10 text-primary-600 transition-colors group-hover:bg-primary-500/20 dark:text-primary-300">
          {icon}
        </span>
        <span className="flex-1">{children}</span>
        <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </Link>
    </li>
  );
}
