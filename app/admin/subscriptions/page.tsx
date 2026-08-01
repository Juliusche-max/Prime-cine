import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PlanCard from "@/components/admin/PlanCard";
import NewPlanForm from "@/components/admin/NewPlanForm";
import { listPlans, listUserSubscriptions } from "@/lib/supabase/admin-queries";

export default async function AdminSubscriptionsPage() {
  const [plans, subscriptions] = await Promise.all([listPlans(), listUserSubscriptions()]);

  return (
    <div>
      <AdminPageHeader title="Abonnements" description="Gérez les plans tarifaires et consultez les abonnés." action={<NewPlanForm />} />

      <div className="px-4 md:px-8 py-6 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((p: any) => (
            <PlanCard key={p.id} plan={p} />
          ))}
          {plans.length === 0 && <p className="text-mist">Aucun plan pour le moment.</p>}
        </div>

        <div>
          <h2 className="mb-4 font-semibold text-bone">Abonnés récents</h2>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-surface text-left text-mist">
                  <th className="px-4 py-3 font-medium">Utilisateur</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Fin de période</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscriptions.map((s: any) => (
                  <tr key={s.id} className="bg-surface/40">
                    <td className="px-4 py-3 text-bone">{s.profiles?.full_name ?? s.profiles?.username ?? "—"}</td>
                    <td className="px-4 py-3 text-mist">{s.subscription_plans?.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-green-500/15 px-2 py-1 text-xs text-green-400 capitalize">{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-mist text-xs">
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("fr-FR") : "—"}
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-mist">
                      Aucun abonné pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
