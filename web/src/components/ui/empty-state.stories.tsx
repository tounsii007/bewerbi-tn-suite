import type { Meta, StoryObj } from "@storybook/react";
import { Inbox } from "lucide-react";
import { EmptyState } from "./empty-state";
import { Button } from "./button";

const meta: Meta<typeof EmptyState> = {
  title: "UI / EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Inbox className="size-6" />,
    title: "Noch keine Bewerbungen",
    description:
      "Sobald du dich auf einen Job bewirbst, erscheint er hier mit Statusverlauf und Erinnerungen.",
    action: <Button>Stellen entdecken</Button>,
  },
};

export const NoAction: Story = {
  args: {
    icon: <Inbox className="size-6" />,
    title: "Keine gespeicherten Suchen",
    description: "Du kannst beliebige Suchanfragen speichern und bei neuen Treffern benachrichtigt werden.",
  },
};

export const Compact: Story = {
  args: { compact: true, title: "Leer", description: "Nichts zu zeigen." },
};
