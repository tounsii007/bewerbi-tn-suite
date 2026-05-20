import type { Meta, StoryObj } from "@storybook/react";
import { AuroraBackground } from "./aurora-background";
import { GradientText } from "./gradient-text";

/**
 * AuroraBackground is the multi-blob animated backdrop that gives
 * Iter 117 onwards its "Apple keynote" feel. Three radial gradients
 * drift at independent rates; the composite never visibly loops.
 *
 * Performance: pure CSS (no canvas, no SVG); blobs are GPU-friendly
 * `transform` animations. Respects `prefers-reduced-motion`.
 */
const meta: Meta<typeof AuroraBackground> = {
  title: "UI / AuroraBackground",
  component: AuroraBackground,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof AuroraBackground>;

const HeroContent = ({ label }: { label: string }) => (
  <div className="grid min-h-[480px] place-items-center px-6">
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600">
        {label}
      </p>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tight">
        Deine Brücke nach{" "}
        <GradientText variant="brand">Deutschland</GradientText>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-gray-600">
        Aurora gibt jedem Hero einen lebendigen, premium Hintergrund —
        ohne Stock-Bilder, ohne Bandwidth-Kosten.
      </p>
    </div>
  </div>
);

export const Default: Story = {
  args: { variant: "default" },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent label="Variant: default" />
    </AuroraBackground>
  ),
};

export const Subtle: Story = {
  args: { variant: "subtle" },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent label="Variant: subtle" />
    </AuroraBackground>
  ),
};

export const Vivid: Story = {
  args: { variant: "vivid" },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent label="Variant: vivid" />
    </AuroraBackground>
  ),
};

export const Static: Story = {
  args: { variant: "vivid", static: true },
  render: (args) => (
    <AuroraBackground {...args}>
      <HeroContent label="static = true (kein Drift)" />
    </AuroraBackground>
  ),
};
