import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex items-start gap-4">
        <Skeleton shape="rounded" className="size-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} tone="glass" className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
