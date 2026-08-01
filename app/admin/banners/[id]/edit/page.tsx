import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BannerForm from "@/components/admin/BannerForm";
import { getBanner, listTitlesForAdmin } from "@/lib/supabase/admin-queries";
import { notFound } from "next/navigation";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [banner, titles] = await Promise.all([getBanner(id), listTitlesForAdmin()]);
  if (!banner) notFound();

  return (
    <div>
      <AdminPageHeader title="Modifier la bannière" />
      <div className="px-4 md:px-8 py-6">
        <BannerForm initial={banner} titles={titles.map((t: any) => ({ id: t.id, title: t.title }))} />
      </div>
    </div>
  );
}
