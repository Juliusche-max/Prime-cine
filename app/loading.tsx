import { HeroSkeleton, MovieRowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="space-y-6 py-8 md:py-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <MovieRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
