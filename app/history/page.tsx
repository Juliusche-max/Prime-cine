import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getWatchHistory, getCurrentProfile } from "@/lib/supabase/queries";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Historique", robots: { index: false, follow: false } };
import { CheckCircle2, PlayCircle } from "lucide-react";

export default async function HistoryPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div>
        <PageHeader eyebrow="Historique" title="Votre historique de visionnage" />
        <div className="px-4 md:px-10 py-16 text-center">
          <p className="mb-6 text-mist">Connectez-vous pour consulter ce que vous avez regardé.</p>
          <Link href="/login?next=/history">
            <Button size="lg">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  const history = await getWatchHistory();

  return (
    <div>
      <PageHeader
        eyebrow="Historique"
        title="Historique de visionnage"
        description="Tout ce que vous avez regardé sur Prime Ciné, du plus récent au plus ancien."
      />

      <div className="px-4 md:px-10 py-8">
        {history.length === 0 ? (
          <p className="text-mist text-center py-12">Vous n&apos;avez encore rien regardé.</p>
        ) : (
          <div className="divide-y divide-white/5 rounded-lg border border-white/10 bg-surface">
            {history.map((entry, i) => (
              <Link
                key={entry.title.id + i}
                href={`/watch/${entry.title.slug}`}
                className="flex items-center gap-4 p-4 hover:bg-elevated transition-colors"
              >
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-elevated2">
                  <Image src={entry.title.posterUrl} alt={entry.title.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-bone truncate">{entry.title.title}</p>
                  <p className="text-xs text-mist mt-0.5">
                    {new Date(entry.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-prime" style={{ width: `${entry.percent}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-mist">
                  {entry.completed ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 size={14} /> Terminé
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gold">
                      <PlayCircle size={14} /> {Math.round(entry.percent)}%
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
