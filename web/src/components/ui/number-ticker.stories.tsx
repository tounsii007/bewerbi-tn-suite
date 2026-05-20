import type { Meta, StoryObj } from "@storybook/react";
import { NumberTicker } from "./number-ticker";
import { GradientText } from "./gradient-text";

const meta: Meta<typeof NumberTicker> = {
  title: "UI / NumberTicker",
  component: NumberTicker,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof NumberTicker>;

const wrapper = (n: React.ReactNode, label: string) => (
  <div className="text-center">
    <div className="text-6xl font-extrabold leading-none">{n}</div>
    <div className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-500">
      {label}
    </div>
  </div>
);

export const Basic: Story = {
  args: { value: 1284 },
  render: (args) => wrapper(<NumberTicker {...args} />, "Bewerber"),
};

export const Percent: Story = {
  args: { value: 94, suffix: " %" },
  render: (args) => wrapper(<NumberTicker {...args} />, "Match-Treffsicherheit"),
};

export const Currency: Story = {
  args: { value: 45_300, prefix: "€ " },
  render: (args) => wrapper(<NumberTicker {...args} />, "Mindestgehalt"),
};

export const WithGradient: Story = {
  args: { value: 12_840, suffix: "+" },
  render: (args) =>
    wrapper(
      <GradientText variant="brand">
        <NumberTicker {...args} />
      </GradientText>,
      "Aktive Bewerber",
    ),
};

export const SnappySpring: Story = {
  args: { value: 487, stiffness: 200, damping: 15 },
  render: (args) =>
    wrapper(
      <NumberTicker {...args} />,
      "stiffness 200 / damping 15 (snappy)",
    ),
};

export const SoftSpring: Story = {
  args: { value: 487, stiffness: 40, damping: 30 },
  render: (args) =>
    wrapper(<NumberTicker {...args} />, "stiffness 40 / damping 30 (sanft)"),
};
