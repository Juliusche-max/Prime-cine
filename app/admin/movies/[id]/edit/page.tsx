import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TitleForm from "@/components/admin/TitleForm";
import { getTitleForAdmin, listAllGenres } from "@/lib/supabase/admin-queries";
import { notFound } from "next/navigation";

export default async function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [title, genres] = await Promise.all([getTitleForAdmin(id), listAllGenres()]);
  if (!title) notFound();

  return (
    <div>
      <AdminPageHeader title={`Modifier « ${title.title} »`} description="Mettez à jour les informations ou les médias de ce film." />
      <div className="px-4 md:px-8 py-6">
        <TitleForm mode="movie" genres={genres} initial={title} />
      </div>
    </div>
  );
}
