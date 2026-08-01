import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import { Film } from "lucide-react";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-24">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1489599162946-4dc4f1a2c0b7?w=1920&h=1080&fit=crop"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-void/70" />
      </div>

      <div className="w-full max-w-md rounded-lg border border-white/10 bg-surface/90 backdrop-blur-sm p-8 shadow-2xl">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-prime">
            <Film size={18} className="text-bone" />
          </div>
          <span className="font-display text-2xl font-semibold text-bone">
            Prime <span className="text-prime">Ciné</span>
          </span>
        </Link>

        <h1 className="mb-1 text-center font-display text-2xl font-semibold text-bone">Content de vous revoir</h1>
        <p className="mb-6 text-center text-sm text-mist">Connectez-vous pour continuer votre visionnage.</p>

        <LoginForm next={params.next ?? "/"} justRegistered={params.registered === "1"} />

        <p className="mt-6 text-center text-sm text-mist">
          Nouveau sur Prime Ciné ?{" "}
          <Link href="/register" className="font-semibold text-prime hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
