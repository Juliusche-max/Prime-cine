"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-prime/15 text-prime mb-5">
        <AlertTriangle size={24} />
      </div>
      <h1 className="mb-2 font-display text-xl font-semibold text-bone">Erreur dans le tableau de bord</h1>
      <p className="mb-6 max-w-sm text-sm text-mist">
        Cette section n&apos;a pas pu se charger. Vérifiez votre connexion ou réessayez.
      </p>
      <Button onClick={() => reset()}>Réessayer</Button>
    </div>
  );
}
