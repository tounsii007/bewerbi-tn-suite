"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — cursor-following radial spotlight.
 *
 * Wrap any group (or use inside GlassCard with spotlight=true) and the
 * spotlight follows the pointer. On touch devices the spotlight is hidden
 * (no hover). Respects prefers-reduced-motion by disabling the transition.
 *
 * <Spotlight>
 *   <ul>
 *     <li>...</li>
 *   </ul>
 * </Spotlight>
 */
interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius of the spotlight in pixels (default 400). */
  size?: number;
  /** Spotlight colour as an OKLCH string (default brand primary). */
  color?: string;
}

export function Spotlight({
  size = 400,
  color = "oklch(0.611 0.1733 254 / 0.22)",
  className,
  children,
  onMouseMove,
  ...props
}: SpotlightProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      ref.current.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      ref.current.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  };

  return (
    <div
      ref={ref}
      className={cn("group relative", className)}
      onMouseMove={handleMove}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-0"
        style={{
          background: `radial-gradient(${size}px circle at var(--spot-x) var(--spot-y), ${color}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
