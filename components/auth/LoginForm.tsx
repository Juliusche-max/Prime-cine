"use client";

import { useState, useTransition } from "react";
import { signInAction } from "@/lib/supabase/auth-actions";
import Button from "@/components/ui/Button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginForm({ next, justRegistered }: { next: string; justRegistered: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signInAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {justRegistered && (
        <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          Compte créé avec succès. Connectez-vous pour continuer.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md border border-prime/40 bg-prime/10 px-3 py-2 text-sm text-prime-light">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-mist">Adresse email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="vous@exemple.com"
            className="w-full rounded-md border border-white/15 bg-elevated py-2.5 pl-10 pr-3 text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-mist">Mot de passe</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full rounded-md border border-white/15 bg-elevated py-2.5 pl-10 pr-10 text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-bone"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full justify-center">
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
