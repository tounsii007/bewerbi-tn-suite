import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </header>
      <Skeleton tone="glass" className="h-28 rounded-2xl" />
      <Skeleton tone="glass" className="h-72 rounded-2xl" />
      <Skeleton tone="glass" className="h-32 rounded-2xl" />
    </div>
  );
}
