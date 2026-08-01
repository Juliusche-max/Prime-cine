import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="px-4 md:px-10 pt-28 md:pt-36 pb-8">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-10 w-96 max-w-full mb-3" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="px-4 md:px-10 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    </div>
  );
}
