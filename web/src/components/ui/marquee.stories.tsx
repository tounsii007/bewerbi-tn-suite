import type { Meta, StoryObj } from "@storybook/react";
import { Marquee } from "./marquee";
import { GlassCard } from "./glass-card";
import { Quote, Star } from "lucide-react";

const meta: Meta<typeof Marquee> = {
  title: "UI / Marquee",
  component: Marquee,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Marquee>;

const LOGOS = [
  "Charité", "Vivantes", "Asklepios", "DRK", "Helios",
  "Siemens", "BMW", "Bosch", "SAP", "Telekom",
];

export const LogoStrip: Story = {
  args: { duration: 30 },
  render: (args) => (
    <Marquee {...args}>
      {LOGOS.map((name) => (
        <div
          key={name}
          className="mx-8 flex h-12 items-center text-2xl font-bold text-gray-400 transition-colors hover:text-gray-700"
        >
          {name}
        </div>
      ))}
    </Marquee>
  ),
};

const QUOTES = [
  { name: "Y.", body: "3 Monate von Tunis nach Frankfurt — bewerbi.tn hat mich durch jeden Anerkennungs-Schritt geführt." },
  { name: "K.", body: "Matching ist tatsächlich anders — 8 Vorstellungs-Gespräche in 4 Wochen." },
  { name: "S.", body: "Mein Deutsch war B1; die App zeigte mir genau, welche Stellen das akzeptieren." },
  { name: "A.", body: "KI-Anschreiben hat den Unterschied gemacht — endlich Antworten." },
];

export const Testimonials: Story = {
  args: { duration: 40, pauseOnHover: true },
  render: (args) => (
    <Marquee {...args}>
      {QUOTES.map((q) => (
        <article key={q.name} className="mx-3 w-[340px] shrink-0">
          <GlassCard strength="default" className="h-full p-5">
            <Quote className="size-5 text-primary-500" />
            <p className="mt-2 text-sm leading-relaxed">{q.body}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-500),var(--color-accent-500))] text-xs font-bold text-white">
                {q.name}
              </div>
              <span className="ml-auto flex gap-0.5 text-warning-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </span>
            </div>
          </GlassCard>
        </article>
      ))}
    </Marquee>
  ),
};

export const Reverse: Story = {
  args: { duration: 30, reverse: true },
  render: (args) => (
    <Marquee {...args}>
      {LOGOS.map((name) => (
        <div key={name} className="mx-8 text-2xl font-bold text-gray-400">
          {name}
        </div>
      ))}
    </Marquee>
  ),
};

export const NoFade: Story = {
  args: { duration: 30, fade: false },
  render: (args) => (
    <Marquee {...args}>
      {LOGOS.map((name) => (
        <div key={name} className="mx-8 text-2xl font-bold text-gray-400">
          {name}
        </div>
      ))}
    </Marquee>
  ),
};
