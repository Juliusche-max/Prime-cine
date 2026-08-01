import PageHeader from "@/components/ui/PageHeader";
import { TitleGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader eyebrow="Chargement..." title="Un instant" />
      <div className="py-8">
        <TitleGridSkeleton />
      </div>
    </div>
  );
}
