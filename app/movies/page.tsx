import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import TitleGrid from "@/components/ui/TitleGrid";
import { getPublishedTitles } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Films",
  description: "Tous les longs-métrages camerounais disponibles en streaming sur Prime Ciné.",
};

export default async function MoviesPage() {
  const titles = await getPublishedTitles();
  const movies = titles.filter((t) => t.type === "movie");

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Films"
        description="Tous les longs-métrages camerounais disponibles sur Prime Ciné."
      />
      <div className="py-8">
        <TitleGrid titles={movies} emptyMessage="Aucun film disponible pour le moment." />
      </div>
    </div>
  );
}
