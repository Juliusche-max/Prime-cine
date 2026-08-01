"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import CheckoutModal from "./CheckoutModal";

export default function PlanCard({ plan, featured }: { plan: any; featured?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-col rounded-lg border p-6",
          featured ? "border-prime bg-prime/5 relative" : "border-white/10 bg-surface"
        )}
      >
        {featured && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-prime px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Populaire
          </span>
        )}
        <p className="font-display text-xl font-semibold text-bone">{plan.name}</p>
        <p className="mt-3 text-3xl font-semibold text-bone">
          {plan.price_xaf === 0 ? "Gratuit" : plan.price_xaf.toLocaleString("fr-FR")}
          {plan.price_xaf > 0 && <span className="text-sm font-normal text-mist"> FCFA/{plan.billing_period === "yearly" ? "an" : "mois"}</span>}
        </p>
        {plan.trial_days > 0 && (
          <p className="mt-1 text-xs text-gold">{plan.trial_days} jours d&apos;essai gratuit</p>
        )}
        <ul className="mt-5 space-y-2.5 flex-1">
          {(plan.features ?? []).map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-mist">
              <Check size={16} className="mt-0.5 shrink-0 text-prime" /> {f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "mt-6 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
            featured ? "bg-prime text-white hover:bg-prime-light" : "border border-white/15 text-bone hover:border-prime"
          )}
        >
          {plan.trial_days > 0 ? "Commencer l'essai gratuit" : "S'abonner"}
        </button>
      </div>

      {open && (
        <CheckoutModal
          planId={plan.id}
          planName={plan.name}
          priceXaf={plan.price_xaf}
          hasTrial={plan.trial_days > 0}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
