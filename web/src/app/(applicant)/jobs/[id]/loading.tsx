import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl pb-32">
      <Skeleton className="h-8 w-20 mb-4" />
      <Skeleton tone="glass" className="h-44 w-full rounded-3xl" />
      <div className="mt-8 space-y-6">
        <Skeleton tone="glass" className="h-40 rounded-2xl" />
        <Skeleton tone="glass" className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
