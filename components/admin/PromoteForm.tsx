"use client";

import { useState, useTransition } from "react";

export default function PromoteForm({ action }: { action: (formData: FormData) => Promise<{ error?: string; success?: boolean }> }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-prime-light" role="alert">{error}</p>}
      {success && <p className="text-sm text-green-400">Rôle mis à jour avec succès.</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="email@exemple.com"
          className="flex-1 rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-gold focus:outline-none"
        />
        <select name="role" className="rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone focus:border-gold focus:outline-none">
          <option value="moderator">Modérateur</option>
          <option value="admin">Administrateur</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-void hover:bg-gold-light disabled:opacity-60"
        >
          {isPending ? "..." : "Promouvoir"}
        </button>
      </div>
      <p className="text-xs text-mist">La personne doit déjà avoir un compte Prime Ciné.</p>
    </form>
  );
}
