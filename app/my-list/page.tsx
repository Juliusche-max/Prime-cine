import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import TitleGrid from "@/components/ui/TitleGrid";
import { getMyListTitles, getCurrentProfile } from "@/lib/supabase/queries";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Ma Liste", robots: { index: false, follow: false } };

export default async function MyListPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div>
        <PageHeader eyebrow="Ma liste" title="Votre liste vous attend" />
        <div className="px-4 md:px-10 py-16 text-center">
          <p className="mb-6 text-mist">Connectez-vous pour retrouver les titres que vous avez enregistrés.</p>
          <Link href="/login?next=/my-list">
            <Button size="lg">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  const titles = await getMyListTitles();

  return (
    <div>
      <PageHeader
        eyebrow="Ma liste"
        title="Ma Liste"
        description="Les films, séries et documentaires que vous avez ajoutés pour plus tard."
      />
      <div className="py-8">
        <TitleGrid titles={titles} emptyMessage="Votre liste est vide pour le moment. Ajoutez des titres depuis leur fiche ou en survolant une affiche." />
      </div>
    </div>
  );
}
