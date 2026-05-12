import { cn } from "@/lib/cn";

/** Animated placeholder block, used for loading states. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/80 dark:bg-dark-border/80",
        className,
      )}
      {...props}
    />
  );
}
