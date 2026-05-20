import type { Meta, StoryObj } from "@storybook/react";
import { GradientText } from "./gradient-text";

const meta: Meta<typeof GradientText> = {
  title: "UI / GradientText",
  component: GradientText,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof GradientText>;

const sizes = {
  fontSize: "3.5rem",
  fontWeight: 800,
  lineHeight: 1.05,
} as const;

export const Brand: Story = {
  args: { variant: "brand", children: "Deutschland", animate: true },
  render: (args) => <h1 style={sizes}><GradientText {...args} /></h1>,
};

export const Aurora: Story = {
  args: { variant: "aurora", children: "Match-Engine", animate: true },
  render: (args) => <h1 style={sizes}><GradientText {...args} /></h1>,
};

export const Sunrise: Story = {
  args: { variant: "sunrise", children: "Favoriten", animate: true },
  render: (args) => <h1 style={sizes}><GradientText {...args} /></h1>,
};

export const Flame: Story = {
  args: { variant: "flame", children: "Jetzt loslegen", animate: true },
  render: (args) => <h1 style={sizes}><GradientText {...args} /></h1>,
};

export const Static: Story = {
  args: { variant: "brand", children: "Statisch", animate: false },
  render: (args) => <h1 style={sizes}><GradientText {...args} /></h1>,
};
