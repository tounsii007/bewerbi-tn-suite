import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-class composer — merges conflicting utilities intelligently. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
