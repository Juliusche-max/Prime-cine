import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TitleForm from "@/components/admin/TitleForm";
import EpisodeManager from "@/components/admin/EpisodeManager";
import { getTitleForAdmin, listAllGenres } from "@/lib/supabase/admin-queries";
import { notFound } from "next/navigation";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [title, genres] = await Promise.all([getTitleForAdmin(id), listAllGenres()]);
  if (!title) notFound();

  return (
    <div>
      <AdminPageHeader title={`Modifier « ${title.title} »`} description="Mettez à jour la fiche et gérez les épisodes." />
      <div className="px-4 md:px-8 py-6 space-y-10">
        <TitleForm mode="series" genres={genres} initial={title} />
        <EpisodeManager titleId={title.id} episodes={title.episodes ?? []} />
      </div>
    </div>
  );
}
