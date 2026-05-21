import { Skeleton } from "@/components/ui/skeleton";

export default function CvUploadLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="text-center space-y-3">
        <Skeleton shape="rounded" className="size-14 mx-auto" />
        <Skeleton className="h-9 w-1/2 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </header>
      <Skeleton tone="glass" shape="rounded" className="h-80" />
    </div>
  );
}
