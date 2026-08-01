"use client";

import { useState, useTransition } from "react";
import { upsertPlanAction, deletePlanAction } from "@/lib/supabase/admin-actions";
import DeleteButton from "@/components/admin/DeleteButton";
import { Loader2, Pencil, X } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none";

export default function PlanCard({ plan }: { plan: any }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await upsertPlanAction(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-prime/40 bg-surface p-5">
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={plan.id} />
          {error && <p className="text-sm text-prime-light" role="alert">{error}</p>}
          <input name="name" defaultValue={plan.name} required className={inputClass} placeholder="Nom du plan" />
          <select name="tier" defaultValue={plan.tier} className={inputClass}>
            <option value="free">Gratuit</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
          <input name="priceXaf" type="number" defaultValue={plan.price_xaf} className={inputClass} placeholder="Prix (FCFA)" />
          <input name="billingPeriod" defaultValue={plan.billing_period} className={inputClass} placeholder="monthly / yearly" />
          <textarea
            name="features"
            defaultValue={(plan.features ?? []).join("\n")}
            rows={4}
            className={inputClass}
            placeholder="Une fonctionnalité par ligne"
          />
          <input name="sortOrder" type="number" defaultValue={plan.sort_order} className={inputClass} placeholder="Ordre" />
          <label className="flex items-center gap-2 text-sm text-bone">
            <input type="checkbox" name="isActive" defaultChecked={plan.is_active} className="accent-prime" /> Actif
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="rounded bg-prime px-3 py-1.5 text-xs font-semibold text-white hover:bg-prime-light">
              {isPending ? <Loader2 size={13} className="animate-spin" /> : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-mist hover:text-bone">
              <X size={13} /> Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-surface p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-bone">{plan.name}</p>
          <p className="text-xs text-mist capitalize">{plan.tier}</p>
        </div>
        <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${plan.is_active ? "bg-green-500/15 text-green-400" : "bg-mist/15 text-mist"}`}>
          {plan.is_active ? "Actif" : "Inactif"}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-prime">
        {plan.price_xaf.toLocaleString("fr-FR")} <span className="text-sm text-mist">FCFA / {plan.billing_period === "yearly" ? "an" : "mois"}</span>
      </p>
      <ul className="mt-4 space-y-1.5 text-sm text-mist flex-1">
        {(plan.features ?? []).map((f: string, i: number) => (
          <li key={i}>• {f}</li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3">
        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-mist hover:text-bone">
          <Pencil size={13} /> Modifier
        </button>
        <DeleteButton label="Supprimer" onDelete={() => deletePlanAction(plan.id)} />
      </div>
    </div>
  );
}
