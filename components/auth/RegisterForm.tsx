"use client";

import { useState, useTransition } from "react";
import { signUpAction } from "@/lib/supabase/auth-actions";
import Button from "@/components/ui/Button";
import { Mail, Lock, User, AtSign } from "lucide-react";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-md border border-prime/40 bg-prime/10 px-3 py-2 text-sm text-prime-light">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm text-mist">Nom complet</label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Julius Nono"
            className="w-full rounded-md border border-white/15 bg-elevated py-2.5 pl-10 pr-3 text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm text-mist">Nom d&apos;utilisateur</label>
        <div className="relative">
          <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            id="username"
            name="username"
            type="text"
            placeholder="julius237"
            className="w-full rounded-md border border-white/15 bg-elevated py-2.5 pl-10 pr-3 text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </div>
      </div>

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
            type="password"
            required
            minLength={8}
            placeholder="8 caractères minimum"
            className="w-full rounded-md border border-white/15 bg-elevated py-2.5 pl-10 pr-3 text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full justify-center">
        {isPending ? "Création du compte..." : "Créer mon compte"}
      </Button>
    </form>
  );
}
