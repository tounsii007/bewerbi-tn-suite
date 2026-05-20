"use client";

import { cn } from "@/lib/cn";

/**
 * Iter 117 — animated multi-blob gradient backdrop ("aurora").
 *
 * Three SVG-less, GPU-friendly radial blobs drift independently behind your
 * content. Wrap a hero / page section in {@link AuroraBackground} to give it
 * the "Apple keynote" feel without per-page custom gradients.
 *
 * Performance:
 *  - Uses CSS `radial-gradient` + `transform`/`opacity` — no canvas, no SVG,
 *    no JS animation loops.
 *  - Respects `prefers-reduced-motion` via the global rule in globals.css.
 *  - The blobs sit in `position: absolute` with `inset-0` and `-z-10` so they
 *    never block clicks.
 *
 * Variants:
 *  - `subtle`  — faint blobs, ideal for dashboards
 *  - `default` — balanced, ideal for marketing
 *  - `vivid`   — saturated, ideal for landing hero
 */
type Variant = "subtle" | "default" | "vivid";

interface AuroraBackgroundProps {
  variant?: Variant;
  /** Disable the slow drift animation (e.g. on dense dashboards). */
  static?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const blobsFor: Record<Variant, string> = {
  subtle: "opacity-50",
  default: "opacity-70",
  vivid: "opacity-90",
};

export function AuroraBackground({
  variant = "default",
  static: isStatic = false,
  className,
  children,
}: AuroraBackgroundProps) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {/* Backdrop layer — sits behind everything */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          blobsFor[variant],
        )}
        aria-hidden
      >
        {/* Three independently-animated blobs. Each is a circle with a soft
            blur and a brand colour. They drift at different rates so the
            composite never looks like it's looping. */}
        <span
          className={cn(
            "absolute -left-32 -top-32 size-[42rem] rounded-full",
            "bg-[radial-gradient(circle_at_center,oklch(0.879_0.0594_254/0.7),transparent_60%)]",
            !isStatic && "animate-blob",
          )}
        />
        <span
          className={cn(
            "absolute -right-40 top-24 size-[36rem] rounded-full",
            "bg-[radial-gradient(circle_at_center,oklch(0.937_0.0249_25/0.55),transparent_60%)]",
            !isStatic && "animate-blob-slow",
          )}
        />
        <span
          className={cn(
            "absolute left-1/3 bottom-[-12rem] size-[44rem] rounded-full",
            "bg-[radial-gradient(circle_at_center,oklch(0.978_0.0218_156/0.55),transparent_60%)]",
            !isStatic && "animate-blob [animation-delay:-6s]",
          )}
        />
        {/* Dark mode overlay — re-tints blobs so they don't wash out */}
        <span className="absolute inset-0 hidden bg-[oklch(0.197_0.0307_263/0.35)] dark:block" />
      </div>
      {children}
    </div>
  );
}
