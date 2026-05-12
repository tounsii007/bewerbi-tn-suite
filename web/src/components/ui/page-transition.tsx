"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Wraps page content with a soft fade + lift transition between routes. Mount once inside the
 * shared layout. Respects {@code prefers-reduced-motion} via the global CSS rule (framer-motion
 * already honours the media query).
 *
 * Mental model:
 * - on first render: tiny entrance fade
 * - on pathname change: previous content fades out at the same time as the new content
 *   slides up — classic "page is changing" affordance you see in Linear, Vercel, Stripe.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="contents"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
