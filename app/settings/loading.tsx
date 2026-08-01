import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="px-4 md:px-10 pt-28 md:pt-36 pb-8">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-10 w-72 mb-3" />
      </div>
      <div className="px-4 md:px-10 py-10 space-y-6 max-w-3xl">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
