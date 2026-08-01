import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import TitleGrid from "@/components/ui/TitleGrid";
import { getPublishedTitles } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Séries",
  description: "Séries et télé-réalités camerounaises, saison par saison, sur Prime Ciné.",
};

export default async function SeriesPage() {
  const titles = await getPublishedTitles();
  const series = titles.filter((t) => t.type === "series" || t.type === "reality");

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Séries"
        description="Séries et télé-réalités camerounaises, saison par saison."
      />
      <div className="py-8">
        <TitleGrid titles={series} emptyMessage="Aucune série disponible pour le moment." />
      </div>
    </div>
  );
}
