import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles, TrendingUp, Globe } from "lucide-react";
import { GlassCard } from "./glass-card";
import { GradientText } from "./gradient-text";
import { AuroraBackground } from "./aurora-background";

/**
 * GlassCard is the centrepiece of the Iter 117 visual refresh — frosted
 * Apple-style surfaces with optional shimmer borders and cursor-following
 * spotlight. Use sparingly: glass is heavy on the GPU and looks busy in
 * dense grids. For dashboards prefer Card with variant="default".
 */
const meta: Meta<typeof GlassCard> = {
  title: "UI / GlassCard",
  component: GlassCard,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <AuroraBackground variant="vivid" className="min-h-[480px] p-12 rounded-3xl">
        <Story />
      </AuroraBackground>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof GlassCard>;

export const Default: Story = {
  args: { strength: "default" },
  render: (args) => (
    <GlassCard {...args} className="max-w-md p-8">
      <div className="flex items-center gap-3 text-primary-700 dark:text-primary-300">
        <Sparkles className="size-5" />
        <span className="text-xs font-bold uppercase tracking-wider">Tunesien → Deutschland</span>
      </div>
      <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-dark-text">
        Deine Brücke nach <GradientText>Deutschland</GradientText>
      </h3>
      <p className="mt-3 text-gray-600 dark:text-dark-muted">
        Passende Stellen, Anerkennungs-Assistent und KI-gestützte Bewerbungen — in einer App.
      </p>
    </GlassCard>
  ),
};

export const Subtle: Story = {
  ...Default,
  args: { strength: "subtle" },
};

export const Strong: Story = {
  ...Default,
  args: { strength: "strong" },
};

export const Frosted: Story = {
  ...Default,
  args: { strength: "frosted" },
};

export const WithShimmerBorder: Story = {
  args: { strength: "default", shimmer: true },
  render: (args) => (
    <GlassCard {...args} className="max-w-md p-8">
      <TrendingUp className="size-6 text-accent-500" />
      <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-dark-text">Premium-Feature</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
        Animated conic gradient border draws the eye — use on at most one
        card per viewport.
      </p>
    </GlassCard>
  ),
};

export const WithSpotlight: Story = {
  args: { strength: "default", spotlight: true, lift: true },
  render: (args) => (
    <GlassCard {...args} className="max-w-md p-8">
      <Globe className="size-6 text-primary-500" />
      <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-dark-text">
        Hover über mich
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
        Der Spotlight folgt der Maus — funktioniert nicht auf Touch-Geräten.
      </p>
    </GlassCard>
  ),
};

export const WithGlow: Story = {
  args: { strength: "default", glow: "ring" },
  render: (args) => (
    <GlassCard {...args} className="max-w-md p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Mit Ring-Glow</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
        Subtle brand-coloured halo around the card.
      </p>
    </GlassCard>
  ),
};
