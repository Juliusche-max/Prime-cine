import Link from "next/link";
import Image from "next/image";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import Button from "@/components/ui/Button";
import { listTitlesForAdmin } from "@/lib/supabase/admin-queries";
import { deleteTitleAction } from "@/lib/supabase/admin-actions";
import { Plus, Pencil, Star } from "lucide-react";

export default async function AdminMoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const all = await listTitlesForAdmin(q);
  const movies = all.filter((t: any) => t.type === "movie");

  return (
    <div>
      <AdminPageHeader
        title="Films"
        description={`${movies.length} film${movies.length !== 1 ? "s" : ""} au catalogue`}
        action={
          <Link href="/admin/movies/new">
            <Button>
              <Plus size={16} /> Ajouter un film
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
            placeholder="Rechercher un film..."
            className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </form>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-surface text-left text-mist">
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Genres</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Année</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Note</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movies.map((m: any) => (
                <tr key={m.id} className="bg-surface/40 hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-elevated2">
                        {m.poster_url && <Image src={m.poster_url} alt="" fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-bone">{m.title}</p>
                        {m.is_original && <span className="text-[10px] uppercase text-gold">Original</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-mist">
                    {(m.title_genres ?? []).map((tg: any) => tg.genres?.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-mist">{m.release_year ?? "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gold">
                    <span className="flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {Number(m.average_rating ?? 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${m.is_published ? "bg-green-500/15 text-green-400" : "bg-mist/15 text-mist"}`}>
                      {m.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/movies/${m.id}/edit`} className="flex items-center gap-1.5 text-xs text-mist hover:text-bone">
                        <Pencil size={14} /> Modifier
                      </Link>
                      <DeleteButton label="Supprimer" onDelete={() => deleteTitleAction(m.id, "movie")} />
                    </div>
                  </td>
                </tr>
              ))}
              {movies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-mist">
                    Aucun film trouvé.
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
