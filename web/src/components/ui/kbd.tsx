import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Keyboard-key affordance. Render keys individually so each gets its own outline:
 * <pre>
 *   &lt;Kbd&gt;⌘&lt;/Kbd&gt; &lt;Kbd&gt;K&lt;/Kbd&gt;
 * </pre>
 */
export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md px-1.5",
        "font-mono text-[10px] font-semibold tracking-wider",
        "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
        "dark:bg-dark-border dark:text-dark-text dark:ring-dark-border",
        className,
      )}
      {...props}
    />
  );
}
