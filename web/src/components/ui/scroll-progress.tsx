"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Iter 117 — top-of-page horizontal progress bar tied to scroll.
 *
 * Drop into your root layout (or per-page) to give visitors a "you are here"
 * indicator. The bar is fixed at the very top of the viewport, sits above
 * everything (z-80), and is purely decorative — no aria role needed.
 *
 * Uses framer-motion's `useScroll` so it works in modal contexts and SSR-
 * hydrates without flicker.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className={cn(
        "scroll-progress",
        "origin-left",
        className,
      )}
    />
  );
}
