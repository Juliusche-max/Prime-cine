import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { getMyCurrentSubscription, getMyInvoices } from "@/lib/supabase/billing-queries";
import PageHeader from "@/components/ui/PageHeader";
import SubscriptionControls from "@/components/billing/SubscriptionControls";
import Button from "@/components/ui/Button";
import { CreditCard, FileText, User, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Paramètres", robots: { index: false, follow: false } };

const statusLabels: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-green-500/15 text-green-400" },
  trialing: { label: "Essai gratuit", className: "bg-gold/15 text-gold" },
  past_due: { label: "Paiement en retard", className: "bg-prime/15 text-prime-light" },
  canceled: { label: "Annulé", className: "bg-mist/15 text-mist" },
  incomplete: { label: "Incomplet", className: "bg-mist/15 text-mist" },
};

const providerLabels: Record<string, string> = {
  mtn_momo: "MTN Mobile Money",
  orange_money: "Orange Money",
  cinetpay_card: "Carte bancaire",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/settings");

  const [subscription, invoices] = await Promise.all([getMyCurrentSubscription(), getMyInvoices()]);
  const statusInfo = subscription ? statusLabels[subscription.status] : null;

  return (
    <div>
      <PageHeader eyebrow="Compte" title="Paramètres" description="Gérez votre profil, votre abonnement et vos factures." />

      <div className="px-4 md:px-10 py-10 space-y-10 max-w-3xl">
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-medium text-bone">
            <User size={20} className="text-prime" /> Profil
          </h2>
          <div className="rounded-lg border border-white/10 bg-surface p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-mist">Nom complet</p>
              <p className="text-sm text-bone mt-0.5">{profile.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-mist">Email</p>
              <p className="text-sm text-bone mt-0.5">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-mist">Nom d&apos;utilisateur</p>
              <p className="text-sm text-bone mt-0.5">@{profile.username ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-mist">Membre depuis</p>
              <p className="text-sm text-bone mt-0.5">{new Date(profile.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-medium text-bone">
            <CreditCard size={20} className="text-prime" /> Abonnement
          </h2>
          <div className="rounded-lg border border-white/10 bg-surface p-5">
            {subscription ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-bone">{subscription.subscription_plans?.name}</p>
                    <p className="text-xs text-mist mt-1">
                      {subscription.payment_method ? providerLabels[subscription.payment_method] : "Aucun paiement requis"}
                    </p>
                  </div>
                  {statusInfo && (
                    <span className={`rounded px-2.5 py-1 text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
                  )}
                </div>

                {subscription.status === "trialing" && subscription.trial_ends_at && (
                  <p className="mt-3 text-sm text-mist">
                    Votre essai gratuit se termine le{" "}
                    {new Date(subscription.trial_ends_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
                  </p>
                )}
                {subscription.current_period_end && subscription.status === "active" && (
                  <p className="mt-3 text-sm text-mist">
                    {subscription.cancel_at_period_end ? "Se termine" : "Renouvellement"} le{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
                  </p>
                )}

                {["active", "trialing"].includes(subscription.status) && (
                  <div className="mt-4">
                    <SubscriptionControls subscriptionId={subscription.id} cancelAtPeriodEnd={subscription.cancel_at_period_end} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-mist mb-4">Vous n&apos;avez pas d&apos;abonnement actif.</p>
                <Link href="/pricing">
                  <Button>Voir les plans</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-medium text-bone">
            <FileText size={20} className="text-prime" /> Factures
          </h2>
          <div className="rounded-lg border border-white/10 bg-surface divide-y divide-white/10">
            {invoices.map((inv: any) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-elevated transition-colors"
              >
                <div>
                  <p className="text-sm text-bone">{inv.plan_name}</p>
                  <p className="text-xs text-mist mt-0.5">
                    {inv.invoice_number} · {new Date(inv.issued_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-bone">{inv.amount_xaf.toLocaleString("fr-FR")} FCFA</span>
                  <ExternalLink size={14} className="text-mist" />
                </div>
              </Link>
            ))}
            {invoices.length === 0 && <p className="p-6 text-center text-sm text-mist">Aucune facture pour le moment.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
