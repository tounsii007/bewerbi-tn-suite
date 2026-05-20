"use client";

import * as React from "react";
import { motion, useInView, type Variant } from "framer-motion";

/**
 * Iter 117 — fade-in-on-scroll motion helper.
 *
 * Wrap any block in <Reveal> and it eases in (fade + slight Y/X translate)
 * the first time it enters the viewport. Plays once per page load by default.
 *
 * Direction options match the visual intuition: "up" means content starts
 * 16px below its final position and rises into view.
 *
 * <Reveal>...</Reveal>
 * <Reveal direction="left" delay={0.1}>...</Reveal>
 */
type Direction = "up" | "down" | "left" | "right" | "none";

const offsetFor: Record<Direction, { x: number; y: number }> = {
  up:    { x: 0,   y: 16 },
  down:  { x: 0,   y: -16 },
  left:  { x: 16,  y: 0 },
  right: { x: -16, y: 0 },
  none:  { x: 0,   y: 0 },
};

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Total animation duration, in seconds (default 0.6). */
  duration?: number;
  /** Play every time the element re-enters the viewport. Default: false (play once). */
  repeat?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  repeat = false,
  className,
  as = "div",
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const inView = useInView(ref as React.RefObject<Element>, {
    once: !repeat,
    margin: "-10% 0px",
  });

  const offset = offsetFor[direction];
  const hidden: Variant = { opacity: 0, x: offset.x, y: offset.y };
  const visible: Variant = { opacity: 1, x: 0, y: 0 };

  const MotionComponent = motion.create(as) as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & {
      initial?: Variant;
      animate?: Variant;
      transition?: object;
      ref?: React.Ref<HTMLElement>;
    }
  >;

  return (
    <MotionComponent
      ref={ref}
      initial={hidden}
      animate={inView ? visible : hidden}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // out-expo, matches our --ease-out-expo token
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
