import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ShimmerButton } from "./shimmer-button";

const meta: Meta<typeof ShimmerButton> = {
  title: "UI / ShimmerButton",
  component: ShimmerButton,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof ShimmerButton>;

export const Large: Story = {
  args: {
    size: "lg",
    children: (
      <>
        Loslegen <ArrowRight className="size-4" />
      </>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    size: "xl",
    children: (
      <>
        Kostenlos starten <ArrowRight className="size-5" />
      </>
    ),
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: (
      <>
        <Sparkles className="size-4" /> Premium
      </>
    ),
  },
};

export const AsLink: Story = {
  args: {
    size: "lg",
    href: "/register",
    children: "Kostenlos starten",
  },
};

export const Static: Story = {
  args: {
    size: "lg",
    static: true,
    children: "Ohne Rotation (reduced-motion)",
  },
};
