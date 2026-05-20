"use client";

import { Moon, Sun, Monitor, Palette } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useThemeStore, type Theme } from "@/stores/theme-store";
import { cn } from "@/lib/cn";

/**
 * Iter 130 — theme switcher with subtle press animation and glass dropdown.
 *
 * The trigger swaps Sun ↔ Moon with a CSS-only cross-fade tied to the
 * current theme. The dropdown content uses the `glass` utility so it sits
 * cleanly on top of aurora / mesh backgrounds.
 */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const options: {
    value: Theme;
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { value: "light", label: "Hell", hint: "Klassisch — gut für Tageslicht", icon: Sun },
    { value: "dark", label: "Dunkel", hint: "Augenfreundlich am Abend", icon: Moon },
    { value: "system", label: "System", hint: "Folgt deinem OS-Theme", icon: Monitor },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "press group flex size-10 items-center justify-center rounded-full",
          "border border-gray-200/60 bg-white/70 text-gray-600 backdrop-blur",
          "hover:border-primary-200 hover:bg-white hover:text-primary-600",
          "transition-colors duration-200",
          "dark:border-dark-border/60 dark:bg-dark-card/70 dark:text-dark-text",
          "dark:hover:border-primary-500/40 dark:hover:bg-dark-card",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        )}
        aria-label="Design wechseln"
      >
        <Sun className="size-4 transition-transform duration-300 group-hover:rotate-12 dark:hidden" />
        <Moon className="hidden size-4 transition-transform duration-300 group-hover:-rotate-12 dark:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "glass-strong z-50 w-60 rounded-2xl p-1.5",
            "shadow-[var(--shadow-xl)]",
            "data-[state=open]:animate-fade-in-up",
          )}
        >
          <div className="px-3 py-2.5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              <Palette className="size-3.5 text-primary-500" />
              Design
            </p>
          </div>
          {options.map((o) => (
            <DropdownMenu.Item
              key={o.value}
              onSelect={() => setTheme(o.value)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-sm outline-none",
                "transition-colors",
                theme === o.value
                  ? "bg-[linear-gradient(135deg,var(--color-primary-500)/0.15,oklch(0.611_0.18_280)/0.12)] text-primary-700 dark:text-primary-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-bg",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                  theme === o.value
                    ? "bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-dark-bg-alt dark:text-dark-muted",
                )}
              >
                <o.icon className="size-4" />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="font-bold">{o.label}</span>
                <span className="text-[11px] text-gray-500 dark:text-dark-muted">
                  {o.hint}
                </span>
              </span>
              {theme === o.value && (
                <span
                  aria-hidden
                  className="mt-1.5 size-2 rounded-full bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))]"
                />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
