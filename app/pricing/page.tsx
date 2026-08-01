import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import PlanCard from "@/components/billing/PlanCard";
import { getActivePlans } from "@/lib/supabase/billing-queries";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Choisissez votre plan Prime Ciné : essai gratuit, paiement par MTN Mobile Money, Orange Money ou carte bancaire.",
};

export default async function PricingPage() {
  const plans = await getActivePlans();

  return (
    <div>
      <PageHeader
        eyebrow="Tarifs"
        title="Un abonnement pour chaque cinéphile"
        description="Payez par MTN Mobile Money, Orange Money ou carte bancaire. Annulez à tout moment."
      />
      <div className="px-4 md:px-10 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan: any, i: number) => (
            <PlanCard key={plan.id} plan={plan} featured={plan.tier === "standard"} />
          ))}
          {plans.length === 0 && (
            <p className="col-span-full text-center text-mist py-12">
              Aucun plan n&apos;est configuré pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
