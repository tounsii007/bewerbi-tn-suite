import type { Meta, StoryObj } from "@storybook/react";
import { Briefcase, Globe, FileText, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BentoGrid, BentoCell } from "./bento-grid";
import { GradientText } from "./gradient-text";
import { NumberTicker } from "./number-ticker";

const meta: Meta<typeof BentoGrid> = {
  title: "UI / BentoGrid",
  component: BentoGrid,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof BentoGrid>;

export const HeroLayout: Story = {
  render: () => (
    <BentoGrid className="max-w-6xl mx-auto">
      {/* Hero tile — spans 8/12 on lg, 2 rows */}
      <BentoCell span={{ md: 12, lg: 8 }} rows={2} tone="glass" glow="soft" className="p-8">
        <Sparkles className="size-7 text-primary-500" />
        <h3 className="mt-4 text-3xl font-extrabold tracking-tight">
          <GradientText>Matching-Engine</GradientText>
        </h3>
        <p className="mt-3 text-gray-600 dark:text-dark-muted">
          Jobs basierend auf Beruf, Deutsch-Niveau und deinen Skills — fünfmal
          treffsicherer als Volltextsuche.
        </p>
        <div className="mt-6 flex items-baseline gap-2 text-primary-600">
          <NumberTicker value={5} className="text-5xl font-extrabold" />
          <span className="text-2xl font-bold">× besser</span>
        </div>
      </BentoCell>

      {/* Stat tiles — small */}
      <BentoCell span={{ md: 6, lg: 4 }} tone="gradient" className="p-6">
        <TrendingUp className="size-5 text-success-600" />
        <p className="mt-3 text-sm text-gray-500 dark:text-dark-muted">Aktive Bewerber</p>
        <p className="mt-1 text-3xl font-bold">
          <NumberTicker value={12_840} suffix="+" />
        </p>
      </BentoCell>
      <BentoCell span={{ md: 6, lg: 4 }} tone="accent" className="p-6">
        <Briefcase className="size-5 text-accent-600" />
        <p className="mt-3 text-sm text-gray-500 dark:text-dark-muted">Offene Stellen</p>
        <p className="mt-1 text-3xl font-bold">
          <NumberTicker value={3_421} />
        </p>
      </BentoCell>

      {/* Feature tiles — wide bottom row */}
      <BentoCell span={{ md: 6, lg: 4 }} tone="glass" interactive className="p-6">
        <ShieldCheck className="size-5 text-primary-500" />
        <h4 className="mt-3 font-bold">Verifizierte Arbeitgeber</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
          Handelsregister-geprüfte Unternehmen — kein Scam.
        </p>
      </BentoCell>
      <BentoCell span={{ md: 6, lg: 4 }} tone="glass" interactive className="p-6">
        <FileText className="size-5 text-warning-600" />
        <h4 className="mt-3 font-bold">Anerkennungs-Assistent</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
          Step-by-step zur Gleichwertigkeit deiner Qualifikation.
        </p>
      </BentoCell>
      <BentoCell span={{ md: 12, lg: 4 }} tone="glass" interactive className="p-6">
        <Globe className="size-5 text-info-500" />
        <h4 className="mt-3 font-bold">Visa-Tracker</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
          Blaue Karte, §18a, Chancenkarte — mit Checkliste pro Visa-Typ.
        </p>
      </BentoCell>
    </BentoGrid>
  ),
};
