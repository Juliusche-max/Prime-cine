import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden="true" />;
}

export function MovieCardSkeleton() {
  return (
    <div className="w-[168px] sm:w-[196px] md:w-[220px] shrink-0">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="mt-2 h-4 w-3/4 md:hidden" />
    </div>
  );
}

export function MovieRowSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="mb-3 ml-4 md:ml-10 h-6 w-48" />
      <div className="flex gap-3 overflow-hidden px-4 md:px-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[86vh] min-h-[560px] w-full">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative z-10 flex h-full max-w-[1800px] mx-auto flex-col justify-end px-4 md:px-10 pb-16 md:pb-24">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-14 w-96 max-w-full mb-4" />
        <Skeleton className="h-4 w-full max-w-lg mb-2" />
        <Skeleton className="h-4 w-2/3 max-w-md mb-7" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}

export function TitleGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 px-4 md:px-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-14 w-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WatchPageSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="px-4 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="aspect-[2/3] w-full max-w-xs" />
      </div>
    </div>
  );
}
