import { Skeleton } from "@/components/ui/skeleton";

export default function SavedSearchesLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <header className="mb-6 flex items-start gap-4">
        <Skeleton shape="rounded" className="size-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </header>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} tone="glass" className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}
