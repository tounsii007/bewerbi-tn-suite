import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";

/**
 * Iter 151 — 404 page.
 *
 * Renders on any unmatched route. Keeps the brand language (aurora +
 * glass + gradient text) so a user who hit a stale link still feels
 * "in the app", not dumped onto a system page.
 */
export const metadata = {
  title: "Seite nicht gefunden · bewerbi.tn",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <AuroraBackground variant="vivid" className="min-h-dvh">
      <main className="flex min-h-dvh items-center justify-center px-6">
        <GlassCard strength="strong" glow="ring" className="max-w-md p-10 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
            <Compass className="size-8" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
            Hier endet die <GradientText variant="brand">Karte</GradientText>
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted">
            Die gesuchte Seite existiert nicht — vielleicht wurde sie verschoben
            oder der Link ist veraltet.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gradient" leadingIcon={<Compass className="size-4" />}>
              <Link href="/">Zur Startseite</Link>
            </Button>
            <Button asChild variant="outline" leadingIcon={<Search className="size-4" />}>
              <Link href="/search">Stellen suchen</Link>
            </Button>
          </div>
        </GlassCard>
      </main>
    </AuroraBackground>
  );
}
