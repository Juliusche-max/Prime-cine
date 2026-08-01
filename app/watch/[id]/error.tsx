"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { FilmIcon } from "lucide-react";

export default function WatchError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Watch page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <FilmIcon size={32} className="text-prime mb-5" />
      <h1 className="mb-2 font-display text-xl font-semibold text-bone">Impossible de lire ce contenu</h1>
      <p className="mb-6 max-w-sm text-sm text-mist">
        Une erreur est survenue lors du chargement de cette vidéo ou de sa fiche.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Réessayer</Button>
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
}
