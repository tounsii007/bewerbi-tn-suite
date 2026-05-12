"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useThemeStore, type Theme } from "@/stores/theme-store";
import { cn } from "@/lib/cn";

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const options: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "light", label: "Hell", icon: Sun },
    { value: "dark", label: "Dunkel", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-border dark:text-dark-text"
        aria-label="Design wechseln"
      >
        <Sun className="size-4 dark:hidden" />
        <Moon className="hidden size-4 dark:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-40 rounded-xl border border-gray-100 bg-white p-1 shadow-[var(--shadow-lg)] dark:border-dark-border dark:bg-dark-card"
        >
          {options.map((o) => (
            <DropdownMenu.Item
              key={o.value}
              onSelect={() => setTheme(o.value)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none",
                theme === o.value
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-bg",
              )}
            >
              <o.icon className="size-4" />
              {o.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
