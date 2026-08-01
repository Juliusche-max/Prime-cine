import Link from "next/link";
import Button from "@/components/ui/Button";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-prime/15 text-prime mb-6">
        <Film size={28} />
      </div>
      <p className="font-display text-7xl font-semibold text-prime mb-2">404</p>
      <h1 className="mb-3 font-display text-2xl md:text-3xl font-semibold text-bone">
        Cette scène n&apos;existe pas
      </h1>
      <p className="mb-8 max-w-md text-mist">
        La page que vous cherchez a été coupée au montage. Retournez à l&apos;accueil pour continuer à explorer
        le catalogue Prime Ciné.
      </p>
      <Link href="/">
        <Button size="lg">Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
