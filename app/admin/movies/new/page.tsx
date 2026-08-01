import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TitleForm from "@/components/admin/TitleForm";
import { listAllGenres } from "@/lib/supabase/admin-queries";

export default async function NewMoviePage() {
  const genres = await listAllGenres();

  return (
    <div>
      <AdminPageHeader title="Ajouter un film" description="Renseignez les informations puis téléversez les médias." />
      <div className="px-4 md:px-8 py-6">
        <TitleForm mode="movie" genres={genres} />
      </div>
    </div>
  );
}
