import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Globe,
  ShieldCheck,
  FileText,
  Briefcase,
  GraduationCap,
  Plane,
  CheckCircle2,
  Star,
  Building2,
  MessagesSquare,
  Languages,
  Lock,
  Clock,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";

/**
 * Iter 118 — landing page redesign.
 *
 * Apple-style Bento + glassmorphism: aurora hero, sticky glass nav, trust
 * marquee, bento feature grid, live-counter stats, 3-step how-it-works,
 * testimonial marquee, visa-type cards, conic-gradient CTA, rich footer.
 *
 * All copy is German (primary market). i18n for FR/AR comes in Iter 124.
 */
export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-surface text-gray-900 dark:bg-dark-bg dark:text-dark-text">
      <ScrollProgress />
      <StickyNav />

      <HeroSection />
      <TrustStrip />
      <FeaturesBento />
      <StatsSection />
      <HowItWorks />
      <VisaTypesSection />
      <Testimonials />
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Sticky glass navigation
 * ───────────────────────────────────────────────────────────────────────── */
function StickyNav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass-strong border-b border-white/10 dark:border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="group flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
              <Sparkles className="size-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              bewerbi<span className="text-accent-500">.</span>tn
            </span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how">So funktioniert&apos;s</NavLink>
            <NavLink href="#visa">Visum</NavLink>
            <NavLink href="#stimmen">Stimmen</NavLink>
          </ul>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild size="sm" variant="gradient">
              <Link href="/register">
                Kostenlos starten <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-dark-muted dark:hover:text-primary-300"
      >
        {children}
      </a>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Hero with aurora backdrop
 * ───────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <AuroraBackground variant="vivid" className="pb-32 pt-20 md:pt-32">
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          {/* Headline + CTAs */}
          <div className="lg:col-span-7">
            <Reveal direction="up">
              <span className="glass inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                <Globe className="size-3.5" />
                Tunesien → Deutschland · Seit 2024
              </span>
            </Reveal>

            <Reveal direction="up" delay={0.08}>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Deine Brücke nach{" "}
                <GradientText variant="brand" className="pb-2">
                  Deutschland
                </GradientText>
              </h1>
            </Reveal>

            <Reveal direction="up" delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-dark-muted">
                Passende Stellen, Anerkennungs-Assistent, Visum-Tracker und
                KI-gestützte Bewerbungen — alles in einer App.{" "}
                <span className="font-semibold text-gray-900 dark:text-dark-text">
                  Auf Deutsch, Französisch und Arabisch.
                </span>
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <ShimmerButton href="/register" size="xl">
                  Kostenlos starten
                  <ArrowRight className="size-5" />
                </ShimmerButton>
                <Button asChild size="xl" variant="glass">
                  <Link href="/search">
                    Stellen ansehen
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.32}>
              <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-dark-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success-600" />
                  100&nbsp;% kostenlos für Bewerber
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="size-4 text-primary-600" />
                  DSGVO-konform, gehostet in der EU
                </li>
                <li className="flex items-center gap-2">
                  <Languages className="size-4 text-accent-600" />
                  3 Sprachen
                </li>
              </ul>
            </Reveal>
          </div>

          {/* Floating hero cards — visually anchor the right side */}
          <div className="relative h-[520px] lg:col-span-5">
            <Reveal direction="left" delay={0.2}>
              <GlassCard
                strength="strong"
                glow="ring"
                className="absolute right-0 top-4 w-72 p-5 animate-float"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-success-500/15 text-success-600">
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                      Neues Match
                    </p>
                    <p className="font-bold">Pflegekraft · Berlin</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-success-600">94 %</p>
                    <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                      Match-Score
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                    €2.840 / Mo
                  </span>
                </div>
              </GlassCard>
            </Reveal>

            <Reveal direction="right" delay={0.35}>
              <GlassCard
                strength="default"
                className="absolute left-0 top-44 w-72 p-5 animate-float [animation-delay:-2s]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-info-100 text-info-600 dark:bg-info-500/15">
                    <Plane className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                      Visum-Status
                    </p>
                    <p className="font-bold">Blaue Karte EU</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <Step ok>Anerkennung eingereicht</Step>
                  <Step ok>Arbeitsvertrag</Step>
                  <Step>Termin Botschaft</Step>
                </div>
              </GlassCard>
            </Reveal>

            <Reveal direction="up" delay={0.5}>
              <GlassCard
                strength="strong"
                shimmer
                className="absolute bottom-0 right-6 w-64 p-5"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                  <Sparkles className="size-3.5" />
                  KI-Schreiben
                </div>
                <p className="mt-3 text-sm leading-relaxed">
                  <span className="font-semibold">&bdquo;Sehr geehrte Frau&hellip;&ldquo;</span>{" "}
                  &mdash; persönliches Anschreiben in 30&nbsp;Sekunden.
                </p>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>
    </AuroraBackground>
  );
}

function Step({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="size-4 text-success-600" />
      ) : (
        <span className="size-4 rounded-full border-2 border-dashed border-gray-300 dark:border-dark-border" />
      )}
      <span
        className={ok ? "line-through text-gray-400 dark:text-dark-muted" : "font-medium"}
      >
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Trust strip — employer logos in a marquee
 * ───────────────────────────────────────────────────────────────────────── */
function TrustStrip() {
  const logos = [
    "Charité", "Vivantes", "Asklepios", "DRK", "Helios", "Siemens",
    "Daimler", "BMW Group", "Bosch", "SAP", "Deutsche Telekom", "Lufthansa",
  ];
  return (
    <section className="border-y border-gray-100 bg-surface-muted py-10 dark:border-dark-border dark:bg-dark-bg-alt">
      <Reveal>
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-dark-muted">
          Vertrauen von führenden deutschen Arbeitgebern
        </p>
      </Reveal>
      <Marquee duration={50}>
        {logos.map((name) => (
          <div
            key={name}
            className="mx-8 flex h-12 items-center text-2xl font-bold text-gray-400 transition-colors hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text"
          >
            {name}
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Features Bento Grid
 * ───────────────────────────────────────────────────────────────────────── */
function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <Reveal>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            Features
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Alles, was du für den{" "}
            <GradientText variant="flame">Sprung</GradientText> brauchst
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-dark-muted">
            Sechs zusammenspielende Module — von der ersten Bewerbung bis zum
            Visa-Termin in der deutschen Botschaft.
          </p>
        </div>
      </Reveal>

      <BentoGrid>
        {/* Hero feature — 8 cols x 2 rows */}
        <BentoCell
          span={{ md: 12, lg: 8 }}
          rows={2}
          tone="glass"
          glow="soft"
          className="overflow-hidden p-8 md:p-10"
        >
          <Reveal direction="up">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              <Sparkles className="size-3.5" />
              KI-Matching
            </div>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <GradientText variant="brand">Treffsicher</GradientText>{" "}
              statt durch&shy;klicken
            </h3>
            <p className="mt-4 max-w-xl text-gray-600 dark:text-dark-muted">
              Unsere Matching-Engine kombiniert Beruf, anerkannte
              Qualifikationen, Deutsch-Niveau und Kompetenzen. Du siehst nur
              Stellen, für die du <strong>realistisch</strong> in Frage kommst —
              keine Bewerbungslawine ins Leere.
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
              <Stat label="Match-Score">
                <NumberTicker value={94} suffix=" %" className="text-5xl font-extrabold text-primary-600" />
              </Stat>
              <Stat label="Treffer-Quote">
                <NumberTicker value={5} suffix="×" className="text-5xl font-extrabold text-accent-500" /> besser
              </Stat>
            </div>
            {/* Inline diagram — bars representing match strength */}
            <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {[94, 82, 76, 71, 64].map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-dark-bg-alt">
                    <span
                      className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,var(--color-primary-500),oklch(0.711_0.1383_280))]"
                      style={{ height: `${v}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-dark-muted">
                    {v} %
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </BentoCell>

        {/* Anerkennung — 4 cols */}
        <BentoCell span={{ md: 6, lg: 4 }} tone="gradient" interactive className="p-6">
          <FeatureIcon className="bg-success-500/15 text-success-600">
            <GraduationCap className="size-5" />
          </FeatureIcon>
          <h3 className="mt-4 text-xl font-bold">Anerkennungs-Assistent</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Step-by-step zur Gleichwertigkeit deines tunesischen Abschlusses.
            ZAB, IHK FOSA, Bundes&shy;ärzte&shy;kammer — wir wissen wer was
            braucht.
          </p>
        </BentoCell>

        {/* Visum — 4 cols */}
        <BentoCell span={{ md: 6, lg: 4 }} tone="accent" interactive className="p-6">
          <FeatureIcon className="bg-accent-500/15 text-accent-600">
            <Plane className="size-5" />
          </FeatureIcon>
          <h3 className="mt-4 text-xl font-bold">Visum-Tracker</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Blaue Karte EU, §18a/b, Chancenkarte, Aus&shy;bildungs&shy;visum —
            mit Checkliste pro Visa-Typ und Botschafts&shy;termin-Tracker.
          </p>
        </BentoCell>

        {/* Verifizierte AG — 4 cols */}
        <BentoCell span={{ md: 6, lg: 4 }} tone="glass" interactive className="p-6">
          <FeatureIcon className="bg-primary-500/15 text-primary-600">
            <ShieldCheck className="size-5" />
          </FeatureIcon>
          <h3 className="mt-4 text-xl font-bold">Verifizierte Arbeitgeber</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Handelsregister-geprüfte Unternehmen — keine Visa-Mafia, keine
            Phantom-Angebote.
          </p>
        </BentoCell>

        {/* KI-Bewerbung — 4 cols */}
        <BentoCell span={{ md: 6, lg: 4 }} tone="glass" interactive className="p-6">
          <FeatureIcon className="bg-warning-500/15 text-warning-600">
            <FileText className="size-5" />
          </FeatureIcon>
          <h3 className="mt-4 text-xl font-bold">KI-Anschreiben</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Personalisierte Anschreiben in 30 Sekunden — basierend auf
            Stellen&shy;ausschreibung und deinem Profil.
          </p>
        </BentoCell>

        {/* Drei-Sprachen — 4 cols */}
        <BentoCell span={{ md: 12, lg: 4 }} tone="glass" interactive className="p-6">
          <FeatureIcon className="bg-info-500/15 text-info-600">
            <Languages className="size-5" />
          </FeatureIcon>
          <h3 className="mt-4 text-xl font-bold">Drei Sprachen</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Deutsch, Französisch und Arabisch. Du arbeitest in deiner
            Komfort&shy;sprache, dein Recruiter sieht das deutsche Original.
          </p>
        </BentoCell>
      </BentoGrid>
    </section>
  );
}

function FeatureIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid size-11 place-items-center rounded-xl ${className ?? ""}`}>
      {children}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-baseline gap-1 leading-none">{children}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-gray-500 dark:text-dark-muted">
        {label}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Live-counter stats band
 * ───────────────────────────────────────────────────────────────────────── */
function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-surface)_50%,var(--color-accent-50))] py-20 dark:bg-[linear-gradient(135deg,oklch(0.197_0.0307_263),var(--color-dark-bg-alt))]">
      <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_30%_50%,oklch(0.611_0.1733_254/0.18),transparent_60%)]" />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-12 px-6 md:grid-cols-4">
        <StatCounter value={12_840} suffix="+" label="Bewerber registriert" />
        <StatCounter value={3_421} label="Offene Stellen" />
        <StatCounter value={94} suffix=" %" label="Match-Treffsicherheit" />
        <StatCounter value={487} label="Erfolgs-Geschichten" />
      </div>
    </section>
  );
}

function StatCounter({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <Reveal>
      <div className="text-center">
        <p className="text-5xl font-extrabold leading-none">
          <NumberTicker
            value={value}
            suffix={suffix}
            className="bg-clip-text text-transparent bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))]"
          />
        </p>
        <p className="mt-3 text-sm font-medium uppercase tracking-wider text-gray-600 dark:text-dark-muted">
          {label}
        </p>
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * How it works — 3 steps
 * ───────────────────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: <FileText className="size-6" />,
      title: "Profil & CV hochladen",
      body: "5 Minuten Setup. Sprachzertifikate, Berufs&shy;abschluss, Kompetenzen. Unsere KI extrahiert relevante Felder automatisch aus deinem CV-PDF.",
    },
    {
      icon: <Briefcase className="size-6" />,
      title: "Matches & Anerkennung",
      body: "Du siehst täglich neue Stellen, die zu dir passen. Parallel führt dich der Anerkennungs-Assistent durch ZAB / IHK FOSA — du weißt jederzeit, woran es hakt.",
    },
    {
      icon: <Plane className="size-6" />,
      title: "Visa-Termin & Umzug",
      body: "Hast du den Vertrag, generiert die App alle Visum-Unterlagen. Tracker zeigt dir, wann du den Botschaftstermin buchen kannst.",
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <Reveal>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            So funktioniert&apos;s
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            In drei Schritten nach{" "}
            <GradientText variant="brand">Deutschland</GradientText>
          </h2>
        </div>
      </Reveal>

      <ol className="grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1}>
            <div className="relative h-full">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-full top-12 hidden h-px w-12 -translate-x-6 bg-[linear-gradient(90deg,var(--color-primary-400),transparent)] md:block"
                />
              )}
              <div className="lift relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 dark:border-dark-border dark:bg-dark-card">
                <span className="absolute -right-4 -top-4 text-[7rem] font-extrabold leading-none text-primary-50 dark:text-primary-500/10">
                  {i + 1}
                </span>
                <div className="relative">
                  <span className="inline-grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
                    {s.icon}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                  <p
                    className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-dark-muted"
                    dangerouslySetInnerHTML={{ __html: s.body }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Visa types section
 * ───────────────────────────────────────────────────────────────────────── */
function VisaTypesSection() {
  const visas = [
    {
      tag: "Akademiker:innen",
      title: "Blaue Karte EU",
      body: "Mindestgehalt 45.300 € (Engpass: 41.041 €). Beste Option für Ingenieure, Ärzte, IT-Fachleute.",
      badge: "Premium",
      featured: true,
    },
    {
      tag: "Fachkräfte",
      title: "§ 18a · § 18b",
      body: "Klassisches Fachkräfte-Visum. Anerkannter Abschluss + konkretes Jobangebot.",
      badge: "Standard",
    },
    {
      tag: "Job-Suchende",
      title: "Chancenkarte",
      body: "Punktesystem-basiert — du darfst bis zu 1 Jahr in DE einen Job suchen. Neu seit 2024.",
      badge: "Neu",
    },
    {
      tag: "Pflege & Gesundheit",
      title: "Pflege-Visum",
      body: "Beschleunigtes Verfahren. Anerkennungs&shy;partner&shy;schaft möglich.",
      badge: "Schnell",
    },
  ];

  return (
    <section id="visa" className="relative bg-surface-alt py-24 dark:bg-dark-bg-alt md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              Visa-Wege
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Welcher Weg passt zu{" "}
              <GradientText variant="sunrise">dir</GradientText>?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-dark-muted">
              Vier Hauptpfade — wir lotsen dich durch die richtige Tür.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visas.map((v, i) => {
            const card = (
              <GlassCard
                strength="default"
                lift
                glow={v.featured ? "ring" : "none"}
                className="h-full p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    {v.tag}
                  </span>
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold " +
                      (v.featured
                        ? "bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))] text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-dark-bg dark:text-dark-muted")
                    }
                  >
                    {v.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{v.title}</h3>
                <p
                  className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-dark-muted"
                  dangerouslySetInnerHTML={{ __html: v.body }}
                />
                <Link
                  href="/visa"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300"
                >
                  Mehr erfahren <ArrowRight className="size-4" />
                </Link>
              </GlassCard>
            );
            return (
              <Reveal key={v.title} delay={i * 0.06}>
                {v.featured ? (
                  <AnimatedGradientBorder thickness={1.5} radius={1} className="h-full">
                    {card}
                  </AnimatedGradientBorder>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Testimonials — marquee
 * ───────────────────────────────────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    {
      name: "Yasmine B.",
      role: "Ärztin, Frankfurt am Main",
      body: "Drei Monate von Tunis nach Deutschland. Die Anerkennung war der Albtraum-Schritt — bewerbi.tn hat mir gesagt, welches Papier wann wohin geht. Ich wäre allein verloren gewesen.",
    },
    {
      name: "Karim H.",
      role: "DevOps Engineer, München",
      body: "Matching ist tatsächlich anders. Ich habe in 4 Wochen 8 Vorstellungs&shy;gespräche bekommen — vorher mit klassischen Job-Boards: zwei in 6 Monaten.",
    },
    {
      name: "Salma T.",
      role: "Pflegekraft, Hamburg",
      body: "Mein Deutsch war B1, ich dachte das reicht nie. App hat mir genau gezeigt, welche Stellen B1 akzeptieren — und wo ich auf B2 aufstocken muss.",
    },
    {
      name: "Anis M.",
      role: "Bauingenieur, Stuttgart",
      body: "KI-Anschreiben hat den Unterschied gemacht. Plötzlich Antworten von Firmen, die mich vorher ignoriert haben.",
    },
    {
      name: "Lina K.",
      role: "Hebamme, Berlin",
      body: "Visum-Tracker hat mir eine Frist gerettet. Push-Notification: &bdquo;Botschaftstermin in 7 Tagen buchbar.&ldquo; Hätte ich verpasst, 3 Monate Verzug.",
    },
    {
      name: "Mehdi R.",
      role: "Java-Dev, Köln",
      body: "Klare Empfehlung. Bestes Tool im Markt für tunesische Fachkräfte. Punkt.",
    },
  ];

  return (
    <section id="stimmen" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <Reveal>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            Stimmen
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Was unsere{" "}
            <GradientText variant="brand">Community</GradientText> sagt
          </h2>
        </div>
      </Reveal>

      <Marquee duration={45} pauseOnHover>
        {quotes.map((q) => (
          <article
            key={q.name}
            className="mx-3 w-[340px] shrink-0 sm:w-[400px]"
          >
            <GlassCard strength="default" className="h-full p-6">
              <Quote className="size-5 text-primary-500" />
              <p
                className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-dark-text"
                dangerouslySetInnerHTML={{ __html: `&bdquo;${q.body}&ldquo;` }}
              />
              <div className="mt-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))] text-sm font-bold text-white">
                  {q.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{q.name}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">{q.role}</p>
                </div>
                <span className="ml-auto flex items-center gap-0.5 text-warning-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </span>
              </div>
            </GlassCard>
          </article>
        ))}
      </Marquee>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Final CTA with conic gradient backdrop
 * ───────────────────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] p-12 md:p-20">
        {/* Conic backdrop */}
        <div className="absolute inset-0 -z-10 gradient-conic opacity-30 animate-conic-spin [animation-duration:30s]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.197_0.0307_263/0.85),oklch(0.262_0.0291_263/0.95))]" />

        <Reveal>
          <div className="relative text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <Sparkles className="size-3.5" />
              100&nbsp;% kostenlos für Bewerber
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Starte deinen Weg nach{" "}
              <GradientText variant="aurora">Deutschland</GradientText> heute
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
              Konto in 60 Sekunden. Keine Kreditkarte. Keine versteckten Gebühren —
              jemals.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <ShimmerButton href="/register" size="xl">
                Jetzt loslegen <ArrowRight className="size-5" />
              </ShimmerButton>
              <Button
                asChild
                size="xl"
                className="bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/20"
              >
                <Link href="/login">Bereits Konto? Anmelden</Link>
              </Button>
            </div>
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Clock className="size-4" />
                60-Sek Setup
              </li>
              <li className="flex items-center gap-2">
                <Lock className="size-4" />
                DSGVO-konform
              </li>
              <li className="flex items-center gap-2">
                <Languages className="size-4" />
                DE / FR / AR
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Rich footer
 * ───────────────────────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-surface-alt dark:border-dark-border dark:bg-dark-bg-alt">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white">
                <Sparkles className="size-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                bewerbi<span className="text-accent-500">.</span>tn
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-600 dark:text-dark-muted">
              Deine Brücke nach Deutschland — alles aus einer Hand, in drei
              Sprachen, kostenlos für Bewerber.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-gray-500 dark:text-dark-muted">
              <span className="rounded-md bg-success-500/15 px-2 py-1 font-semibold text-success-700 dark:text-success-500">
                DSGVO
              </span>
              <span className="rounded-md bg-info-500/15 px-2 py-1 font-semibold text-info-600">
                EU-Hosting
              </span>
              <span className="rounded-md bg-primary-500/15 px-2 py-1 font-semibold text-primary-700 dark:text-primary-300">
                ISO 27001 angestrebt
              </span>
            </div>
          </div>

          <FooterColumn title="Bewerber">
            <FooterLink href="/search">Stellen suchen</FooterLink>
            <FooterLink href="/anerkennung">Anerkennung</FooterLink>
            <FooterLink href="/visa">Visum</FooterLink>
            <FooterLink href="/cv-upload">CV hochladen</FooterLink>
          </FooterColumn>

          <FooterColumn title="Unternehmen">
            <FooterLink href="/employer">Für Arbeitgeber</FooterLink>
            <FooterLink href="/company">Verifizierung</FooterLink>
            <FooterLink href="#stimmen">Erfolgsgeschichten</FooterLink>
          </FooterColumn>

          <FooterColumn title="Über uns">
            <FooterLink href="/about">Mission</FooterLink>
            <FooterLink href="/security">Sicherheit</FooterLink>
            <FooterLink href="/privacy">Datenschutz</FooterLink>
            <FooterLink href="/imprint">Impressum</FooterLink>
            <FooterLink href="/contact">
              <MessagesSquare className="size-3.5" />
              Kontakt
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-gray-100 pt-8 text-xs text-gray-500 dark:border-dark-border dark:text-dark-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} bewerbi.tn — Tunis · Berlin</p>
          <p className="flex items-center gap-2">
            <Building2 className="size-3.5" />
            Built with ❤ between two shores
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-dark-text">
        {title}
      </h4>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-dark-muted dark:hover:text-primary-300"
      >
        {children}
      </Link>
    </li>
  );
}
