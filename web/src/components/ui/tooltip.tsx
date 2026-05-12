"use client";

import * as React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

/**
 * Project-wide tooltip wrapper. Mount {@link TooltipProvider} once at the root, then use the
 * {@link Tooltip} helper at the call site:
 *
 * <pre>
 * &lt;Tooltip content="Speichern (⌘S)"&gt;
 *   &lt;Button variant="ghost"&gt;...&lt;/Button&gt;
 * &lt;/Tooltip&gt;
 * </pre>
 */
export const TooltipProvider = RadixTooltip.Provider;

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  shortcut?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 300,
  shortcut,
}: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            "z-50 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium",
            "bg-gray-900 text-white shadow-lg",
            "dark:bg-dark-card dark:text-dark-text dark:ring-1 dark:ring-dark-border",
            "data-[state=delayed-open]:animate-fade-in-up",
            "data-[side=top]:animate-fade-in-up",
          )}
        >
          {content}
          {shortcut && (
            <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] tracking-wide dark:bg-dark-border">
              {shortcut}
            </kbd>
          )}
          <RadixTooltip.Arrow className="fill-gray-900 dark:fill-dark-card" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
