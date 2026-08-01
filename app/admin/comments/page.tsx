import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CommentModerationRow from "@/components/admin/CommentModerationRow";
import { listCommentsForModeration } from "@/lib/supabase/admin-queries";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "all" | "hidden" | "visible" }>;
}) {
  const { filter = "all" } = await searchParams;
  const comments = await listCommentsForModeration(filter);

  const tabs: { key: "all" | "visible" | "hidden"; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "visible", label: "Visibles" },
    { key: "hidden", label: "Masqués" },
  ];

  return (
    <div>
      <AdminPageHeader title="Modération des commentaires" description={`${comments.length} commentaire${comments.length !== 1 ? "s" : ""}`} />

      <div className="px-4 md:px-8 py-6">
        <div className="mb-5 flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/comments?filter=${t.key}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium border",
                filter === t.key ? "border-prime bg-prime/15 text-prime" : "border-white/15 text-mist hover:text-bone"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-white/10 bg-surface divide-y divide-white/10">
          {comments.map((c: any) => (
            <CommentModerationRow key={c.id} comment={c} />
          ))}
          {comments.length === 0 && <p className="p-8 text-center text-sm text-mist">Aucun commentaire à afficher.</p>}
        </div>
      </div>
    </div>
  );
}
