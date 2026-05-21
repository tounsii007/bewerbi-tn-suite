import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </header>
      <div className="mb-6">
        <Skeleton tone="glass" className="h-12 w-full rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <Skeleton tone="glass" className="h-96 rounded-2xl" />
        </aside>
        <section className="lg:col-span-9">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} tone="glass" className="h-56 rounded-2xl" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
