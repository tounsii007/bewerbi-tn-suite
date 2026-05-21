import { Skeleton } from "@/components/ui/skeleton";

export default function VisaLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="mb-8 flex items-start gap-4">
        <Skeleton shape="rounded" className="size-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </header>
      <Skeleton tone="glass" className="h-32 rounded-3xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} tone="glass" className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}
