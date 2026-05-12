import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-primary-50 via-white to-primary-50/60 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold tracking-tight text-primary-700 dark:text-primary-300">
          bewerbi<span className="text-accent-500">.</span>tn
        </span>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Anmelden</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Registrieren</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-12 md:grid-cols-2 md:pt-24">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
            <Globe className="size-3.5" />
            Tunesien → Deutschland
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-dark-text">
            Deine Brücke nach{" "}
            <span className="text-primary-600 dark:text-primary-300">Deutschland</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 md:text-xl dark:text-dark-muted">
            Passende Stellen, Anerkennungs-Assistent, Visum-Tracker und KI-gestützte
            Bewerbungsschreiben — alles in einer App, in drei Sprachen.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/register">
                Kostenlos starten <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/search">Stellen ansehen</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<CheckCircle2 className="size-5 text-success-600" />}
            title="Anerkennungs-Assistent"
            description="Step-by-step zur Gleichwertigkeit deiner Qualifikation."
          />
          <FeatureCard
            icon={<ShieldCheck className="size-5 text-primary-600" />}
            title="Visum-Tracker"
            description="Blaue Karte, §18a, Chancenkarte — mit Checkliste pro Visa-Typ."
          />
          <FeatureCard
            icon={<Globe className="size-5 text-accent-500" />}
            title="Matching-Engine"
            description="Jobs basierend auf Beruf, Deutsch-Niveau und deinen Skills."
          />
          <FeatureCard
            icon={<CheckCircle2 className="size-5 text-warning-600" />}
            title="Verifizierte Arbeitgeber"
            description="Handelsregister-geprüfte Unternehmen — kein Scam."
          />
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-16 text-sm text-gray-500 dark:text-dark-muted">
        © {new Date().getFullYear()} bewerbi.tn
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[var(--shadow-md)] dark:border-dark-border dark:bg-dark-card">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/15">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-dark-text">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">{description}</p>
    </div>
  );
}
