import type { Meta, StoryObj } from "@storybook/react";
import { Reveal } from "./reveal";
import { GlassCard } from "./glass-card";

const meta: Meta<typeof Reveal> = {
  title: "UI / Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Reveal>;

const card = (label: string) => (
  <GlassCard strength="default" className="p-6">
    <p className="text-sm font-bold">{label}</p>
    <p className="mt-1 text-xs text-gray-500">
      Wird beim Scroll in den Viewport eingeblendet.
    </p>
  </GlassCard>
);

export const Up: Story = {
  args: { direction: "up" },
  render: (args) => <Reveal {...args}>{card("direction: up")}</Reveal>,
};

export const Left: Story = {
  args: { direction: "left" },
  render: (args) => <Reveal {...args}>{card("direction: left")}</Reveal>,
};

export const Right: Story = {
  args: { direction: "right" },
  render: (args) => <Reveal {...args}>{card("direction: right")}</Reveal>,
};

export const Staggered: Story = {
  render: () => (
    <div className="grid gap-3">
      {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
        <Reveal key={delay} delay={delay} direction="up">
          {card(`delay: ${delay}s`)}
        </Reveal>
      ))}
    </div>
  ),
};

export const Repeating: Story = {
  args: { repeat: true, direction: "up" },
  render: (args) => (
    <div className="grid gap-4">
      <div className="h-[80vh] grid place-items-center text-sm text-gray-500">
        Scroll runter um die Reveal-Animation zu sehen
      </div>
      <Reveal {...args}>{card("repeat: true — re-plays each time")}</Reveal>
    </div>
  ),
};
