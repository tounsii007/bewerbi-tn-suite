import type { Meta, StoryObj } from "@storybook/react";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "./button";

/**
 * Button is the project's primary action affordance. The variants below are the canonical
 * set used across web and mobile — keep them in sync when adding new ones.
 */
const meta: Meta<typeof Button> = {
  title: "UI / Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "gradient",
        "outline",
        "ghost",
        "destructive",
        "subtle",
        "link",
        "glass",
      ],
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg", "xl", "icon", "icon-sm"],
    },
    loading: { control: "boolean" },
    block: { control: "boolean" },
  },
  args: {
    children: "Bewerben",
    variant: "default",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Gradient: Story = { args: { variant: "gradient" } };

export const Outline: Story = { args: { variant: "outline" } };

export const Destructive: Story = {
  args: { variant: "destructive", children: "Konto löschen" },
};

export const Loading: Story = {
  args: { loading: true, children: "Wird gespeichert…" },
};

export const WithIcons: Story = {
  args: {
    children: "Favorisieren",
    leadingIcon: <Heart className="size-4" />,
    trailingIcon: <ArrowRight className="size-4" />,
  },
};

export const SizesShowcase: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(["sm", "md", "lg", "xl"] as const).map((s) => (
        <Button key={s} {...args} size={s}>
          Size {s}
        </Button>
      ))}
    </div>
  ),
};
