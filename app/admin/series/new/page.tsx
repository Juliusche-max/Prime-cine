import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TitleForm from "@/components/admin/TitleForm";
import { listAllGenres } from "@/lib/supabase/admin-queries";

export default async function NewSeriesPage() {
  const genres = await listAllGenres();

  return (
    <div>
      <AdminPageHeader
        title="Ajouter une série"
        description="Créez d'abord la fiche série, puis ajoutez ses épisodes depuis la page de modification."
      />
      <div className="px-4 md:px-8 py-6">
        <TitleForm mode="series" genres={genres} />
      </div>
    </div>
  );
}
