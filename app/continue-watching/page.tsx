import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import TitleGrid from "@/components/ui/TitleGrid";
import { getContinueWatchingTitles, getCurrentProfile } from "@/lib/supabase/queries";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Reprendre la lecture", robots: { index: false, follow: false } };

export default async function ContinueWatchingPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div>
        <PageHeader eyebrow="Reprendre" title="Reprendre la lecture" />
        <div className="px-4 md:px-10 py-16 text-center">
          <p className="mb-6 text-mist">Connectez-vous pour reprendre là où vous vous étiez arrêté.</p>
          <Link href="/login?next=/continue-watching">
            <Button size="lg">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  const titles = await getContinueWatchingTitles();

  return (
    <div>
      <PageHeader
        eyebrow="Reprendre"
        title="Reprendre la lecture"
        description="Vos épisodes et films en cours, avec la progression exacte là où vous vous êtes arrêté."
      />
      <div className="py-8">
        <TitleGrid titles={titles} emptyMessage="Rien à reprendre pour l'instant. Lancez un titre pour le retrouver ici." />
      </div>
    </div>
  );
}
