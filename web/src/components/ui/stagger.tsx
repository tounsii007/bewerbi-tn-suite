"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Staggered list animation primitives. Use {@link StaggerContainer} as a wrapper around the
 * list and {@link StaggerItem} for each child. Items fade up from {@code y: 8} with a 40ms
 * delay between siblings — the same "list reveal" pattern Linear and Notion ship.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
};

export function StaggerContainer({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={itemVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
