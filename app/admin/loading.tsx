import { TableSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="px-4 md:px-8 py-6 border-b border-white/10">
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="px-4 md:px-8 py-6">
        <TableSkeleton />
      </div>
    </div>
  );
}
