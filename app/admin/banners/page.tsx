import Link from "next/link";
import Image from "next/image";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import Button from "@/components/ui/Button";
import { listBanners } from "@/lib/supabase/admin-queries";
import { deleteBannerAction } from "@/lib/supabase/admin-actions";
import { Plus, Pencil } from "lucide-react";

export default async function AdminBannersPage() {
  const banners = await listBanners();

  return (
    <div>
      <AdminPageHeader
        title="Bannières"
        description="Gérez les bannières promotionnelles mises en avant sur le site."
        action={
          <Link href="/admin/banners/new">
            <Button>
              <Plus size={16} /> Nouvelle bannière
            </Button>
          </Link>
        }
      />

      <div className="px-4 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((b: any) => (
          <div key={b.id} className="rounded-lg border border-white/10 bg-surface overflow-hidden">
            <div className="relative aspect-video bg-elevated2">
              {b.image_url && <Image src={b.image_url} alt="" fill className="object-cover" />}
              <span
                className={`absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-semibold ${
                  b.is_active ? "bg-green-500/80 text-white" : "bg-mist/60 text-white"
                }`}
              >
                {b.is_active ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-bone truncate">{b.heading}</p>
              <p className="text-xs text-mist mt-1 line-clamp-2">{b.subheading}</p>
              <div className="mt-3 flex items-center justify-between">
                <Link href={`/admin/banners/${b.id}/edit`} className="flex items-center gap-1.5 text-xs text-mist hover:text-bone">
                  <Pencil size={13} /> Modifier
                </Link>
                <DeleteButton label="Supprimer" onDelete={() => deleteBannerAction(b.id)} />
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="col-span-full text-center text-mist py-12">Aucune bannière pour le moment.</p>}
      </div>
    </div>
  );
}
