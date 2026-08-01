import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BannerForm from "@/components/admin/BannerForm";
import { listTitlesForAdmin } from "@/lib/supabase/admin-queries";

export default async function NewBannerPage() {
  const titles = await listTitlesForAdmin();

  return (
    <div>
      <AdminPageHeader title="Nouvelle bannière" />
      <div className="px-4 md:px-8 py-6">
        <BannerForm titles={titles.map((t: any) => ({ id: t.id, title: t.title }))} />
      </div>
    </div>
  );
}
