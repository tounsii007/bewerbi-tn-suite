import { Skeleton } from "@/components/ui/skeleton";

/**
 * Iter 147 — route-level loading state. Next.js automatically renders
 * this while the page's data fetches are in flight, so users see
 * skeletons instead of a blank screen during navigation.
 *
 * Shape mirrors the actual dashboard layout: aurora hero + bento grid
 * + categories row + recommendation list.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <Skeleton
        tone="glass"
        shape="rounded"
        className="h-44 w-full rounded-3xl"
      />
      <div className="bento">
        <Skeleton tone="glass" shape="rounded" className="col-span-12 lg:col-span-6 h-48" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-3 h-48" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-3 h-48" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-4 h-44" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-4 h-44" />
        <Skeleton tone="glass" shape="rounded" className="col-span-12 lg:col-span-4 h-44" />
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} shape="rounded" className="h-20" />
        ))}
      </div>
    </div>
  );
}
