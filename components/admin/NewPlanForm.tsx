"use client";

import { useState, useTransition } from "react";
import { upsertPlanAction } from "@/lib/supabase/admin-actions";
import Button from "@/components/ui/Button";
import { Plus, X } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none";

export default function NewPlanForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await upsertPlanAction(formData);
      if (result?.error) setError(result.error);
      else setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Nouveau plan
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-prime/40 bg-surface p-5 max-w-md">
      <form action={handleSubmit} className="space-y-3">
        {error && <p className="text-sm text-prime-light" role="alert">{error}</p>}
        <input name="name" required placeholder="Nom du plan" className={inputClass} />
        <select name="tier" className={inputClass} defaultValue="standard">
          <option value="free">Gratuit</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
        <input name="priceXaf" type="number" placeholder="Prix (FCFA)" className={inputClass} />
        <input name="billingPeriod" placeholder="monthly" defaultValue="monthly" className={inputClass} />
        <textarea name="features" rows={3} placeholder="Une fonctionnalité par ligne" className={inputClass} />
        <input name="sortOrder" type="number" placeholder="Ordre" defaultValue={0} className={inputClass} />
        <div className="flex gap-2">
          <button type="submit" disabled={isPending} className="rounded bg-prime px-3 py-1.5 text-xs font-semibold text-white hover:bg-prime-light">
            {isPending ? "..." : "Créer"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="flex items-center gap-1 text-xs text-mist hover:text-bone">
            <X size={13} /> Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
