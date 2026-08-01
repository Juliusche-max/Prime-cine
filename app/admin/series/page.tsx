import Link from "next/link";
import Image from "next/image";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import Button from "@/components/ui/Button";
import { listTitlesForAdmin } from "@/lib/supabase/admin-queries";
import { deleteTitleAction } from "@/lib/supabase/admin-actions";
import { Plus, Pencil, ListVideo } from "lucide-react";

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const all = await listTitlesForAdmin(q);
  const series = all.filter((t: any) => t.type === "series" || t.type === "reality");

  return (
    <div>
      <AdminPageHeader
        title="Séries"
        description={`${series.length} série${series.length !== 1 ? "s" : ""} au catalogue`}
        action={
          <Link href="/admin/series/new">
            <Button>
              <Plus size={16} /> Ajouter une série
            </Button>
          </Link>
        }
      />

      <div className="px-4 md:px-8 py-6">
        <form className="mb-5 max-w-sm">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher une série..."
            className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </form>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-surface text-left text-mist">
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Épisodes</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {series.map((s: any) => (
                <tr key={s.id} className="bg-surface/40 hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-elevated2">
                        {s.poster_url && <Image src={s.poster_url} alt="" fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-bone">{s.title}</p>
                        {s.is_original && <span className="text-[10px] uppercase text-gold">Original</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-mist capitalize">{s.type}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-mist">{(s.episodes ?? []).length}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${s.is_published ? "bg-green-500/15 text-green-400" : "bg-mist/15 text-mist"}`}>
                      {s.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/series/${s.id}/edit`} className="flex items-center gap-1.5 text-xs text-mist hover:text-bone">
                        <ListVideo size={14} /> Épisodes
                      </Link>
                      <Link href={`/admin/series/${s.id}/edit`} className="flex items-center gap-1.5 text-xs text-mist hover:text-bone">
                        <Pencil size={14} /> Modifier
                      </Link>
                      <DeleteButton label="Supprimer" onDelete={() => deleteTitleAction(s.id, "series")} />
                    </div>
                  </td>
                </tr>
              ))}
              {series.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-mist">
                    Aucune série trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
