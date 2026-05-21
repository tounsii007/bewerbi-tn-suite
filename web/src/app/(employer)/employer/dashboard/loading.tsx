import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Skeleton tone="glass" className="h-40 rounded-3xl" />
      <div className="bento">
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-3 h-40" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-3 h-40" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-3 h-40" />
        <Skeleton tone="glass" shape="rounded" className="col-span-6 lg:col-span-3 h-40" />
        <Skeleton tone="glass" shape="rounded" className="col-span-12 lg:col-span-8 h-48" />
        <Skeleton tone="glass" shape="rounded" className="col-span-12 lg:col-span-4 h-48" />
      </div>
    </div>
  );
}
