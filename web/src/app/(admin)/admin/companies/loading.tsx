import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCompaniesLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <header className="mb-8 flex items-start gap-4">
        <Skeleton shape="rounded" className="size-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </header>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} tone="glass" className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}
