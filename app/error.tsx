"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-prime/15 text-prime mb-6">
        <AlertTriangle size={28} />
      </div>
      <h1 className="mb-3 font-display text-2xl md:text-3xl font-semibold text-bone">
        Un problème technique est survenu
      </h1>
      <p className="mb-8 max-w-md text-mist">
        Nous n&apos;avons pas pu charger cette page. Réessayez, ou revenez à l&apos;accueil si le problème persiste.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} size="lg">
          Réessayer
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-8 max-w-2xl overflow-auto rounded-md bg-elevated p-4 text-left text-xs text-prime-light">
          {error.message}
        </pre>
      )}
    </div>
  );
}
