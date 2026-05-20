"use client";

import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Globe,
  Briefcase,
  Lock,
  Languages,
} from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/cn";

/**
 * Iter 119 — shared split-screen shell for every auth page.
 *
 * Layout:
 *   - lg+: 2 columns. Left (5/12) is the brand panel — aurora bg, floating
 *     illustration cards, quote. Right (7/12) is the form area with a
 *     centered glass card.
 *   - md and below: single column, no brand panel. Auth pages stay fast
 *     on mobile (the dominant device for our market).
 *
 * Children render inside a max-w-md glass card by default, so individual
 * auth pages only need to provide their form. Pass `noCard` to render the
 * children full-width (used for the success / error states which already
 * own their visual frame).
 */
interface AuthShellProps {
  children: React.ReactNode;
  /** Page title — shown only as the screen-reader landmark, not visually. */
  title: string;
  /** When true, skip the default GlassCard wrapper around children. */
  noCard?: boolean;
  /** Max width of the form area (default "md"). */
  formMaxWidth?: "sm" | "md" | "lg";
}

const widthClass: Record<NonNullable<AuthShellProps["formMaxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function AuthShell({
  children,
  title,
  noCard = false,
  formMaxWidth = "md",
}: AuthShellProps) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-12">
      <h1 className="sr-only">{title}</h1>

      {/* Brand panel — visible only on lg+ */}
      <BrandPanel />

      {/* Form panel */}
      <section className="relative flex min-h-dvh flex-col lg:col-span-7">
        {/* Top bar with logo (mobile) + language switcher */}
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link
            href="/"
            className="flex items-center gap-2 lg:hidden"
            aria-label="bewerbi.tn"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-extrabold tracking-tight">
              bewerbi<span className="text-accent-500">.</span>tn
            </span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Centered form area */}
        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className={cn("w-full", widthClass[formMaxWidth])}>
            {noCard ? (
              children
            ) : (
              <GlassCard strength="strong" glow="soft" className="p-8 sm:p-10">
                {children}
              </GlassCard>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Brand panel — only rendered on lg+ via the parent's grid.
 * ───────────────────────────────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden lg:col-span-5 lg:block">
      <AuroraBackground variant="vivid" className="h-full">
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          {/* Brand mark */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
              <Sparkles className="size-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              bewerbi<span className="text-accent-500">.</span>tn
            </span>
          </Link>

          {/* Hero quote */}
          <div className="relative">
            <Reveal direction="up" delay={0.1}>
              <p className="text-3xl font-extrabold leading-tight xl:text-4xl">
                Deine Brücke nach{" "}
                <GradientText variant="brand">Deutschland</GradientText>
              </p>
              <p className="mt-4 max-w-md text-base text-gray-700 dark:text-dark-muted">
                Passende Stellen, Anerkennung, Visum-Tracker und KI-Anschreiben
                — alles in einer App, in drei Sprachen.
              </p>
            </Reveal>

            {/* Floating illustration cards */}
            <div className="relative mt-10 h-56">
              <Reveal direction="left" delay={0.25}>
                <GlassCard
                  strength="strong"
                  className="absolute left-0 top-0 w-60 p-4 animate-float"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-success-500/15 text-success-600">
                      <Briefcase className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                        Match-Score
                      </p>
                      <p className="text-sm font-bold">Pflegekraft · 94 %</p>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>

              <Reveal direction="right" delay={0.4}>
                <GlassCard
                  strength="default"
                  className="absolute right-0 top-16 w-60 p-4 animate-float [animation-delay:-3s]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-primary-500/15 text-primary-600">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                        Visum
                      </p>
                      <p className="text-sm font-bold">Blaue Karte EU</p>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            </div>
          </div>

          {/* Trust badges */}
          <Reveal direction="up" delay={0.6}>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-dark-muted">
              <li className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-success-600" />
                DSGVO-konform
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary-600" />
                EU-Hosting
              </li>
              <li className="flex items-center gap-1.5">
                <Languages className="size-3.5 text-accent-600" />
                DE · FR · AR
              </li>
            </ul>
          </Reveal>
        </div>
      </AuroraBackground>
    </aside>
  );
}
