import { getCurrentProfile } from "@/lib/supabase/queries";
import { getAnalytics, listCommentsForModeration } from "@/lib/supabase/admin-queries";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Users, Film, MessageSquare, Star, CreditCard, ShieldCheck } from "lucide-react";

const roleLabels: Record<string, string> = {
  super_admin: "Super Administrateur",
  admin: "Administrateur",
  moderator: "Modérateur",
  user: "Utilisateur",
};

export default async function AdminOverviewPage() {
  const profile = await getCurrentProfile();
  const [analytics, recentComments] = await Promise.all([getAnalytics(), listCommentsForModeration("all")]);

  const stats = [
    { label: "Utilisateurs inscrits", value: analytics.totalUsers, icon: Users },
    { label: "Titres au catalogue", value: analytics.totalTitles, icon: Film },
    { label: "Commentaires publiés", value: analytics.totalComments, icon: MessageSquare },
    { label: "Notes soumises", value: analytics.totalRatings, icon: Star },
    { label: "Abonnements actifs", value: analytics.activeSubscriptions, icon: CreditCard },
  ];

  const maxUsersByDay = Math.max(1, ...analytics.usersByDay.map((d) => d.count));

  return (
    <div>
      <AdminPageHeader
        title="Vue d'ensemble"
        description={`Connecté en tant que ${profile?.full_name ?? profile?.email} · ${roleLabels[profile?.role ?? "user"]}`}
      />

      <div className="px-4 md:px-8 py-6 space-y-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-white/10 bg-surface p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-prime/15 text-prime mb-3">
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-semibold text-bone">{s.value}</p>
              <p className="text-xs text-mist mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-white/10 bg-surface p-5">
            <h2 className="mb-4 font-semibold text-bone">Nouveaux utilisateurs (14 derniers jours)</h2>
            {analytics.usersByDay.length === 0 ? (
              <p className="text-sm text-mist">Pas encore de données.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-32">
                {analytics.usersByDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-prime/70 hover:bg-prime transition-colors"
                      style={{ height: `${(d.count / maxUsersByDay) * 100}%`, minHeight: 4 }}
                      title={`${d.count} le ${d.day}`}
                    />
                    <span className="text-[9px] text-mist rotate-0">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-surface p-5">
            <h2 className="mb-4 font-semibold text-bone">Répartition du catalogue</h2>
            <div className="space-y-3">
              {analytics.titlesByType.map((t) => (
                <div key={t.type}>
                  <div className="flex justify-between text-xs text-mist mb-1">
                    <span className="capitalize">{t.type}</span>
                    <span>{t.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-elevated2">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(t.count / Math.max(1, analytics.totalTitles)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {analytics.titlesByType.length === 0 && <p className="text-sm text-mist">Aucun titre pour le moment.</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-white/10 bg-surface p-5">
            <h2 className="mb-4 font-semibold text-bone">Titres les mieux notés</h2>
            <div className="space-y-3">
              {analytics.topRated.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-bone truncate">{t.title}</span>
                  <span className="flex items-center gap-1 text-gold shrink-0 ml-3">
                    <Star size={12} fill="currentColor" /> {Number(t.average_rating).toFixed(1)} · {t.ratings_count} votes
                  </span>
                </div>
              ))}
              {analytics.topRated.length === 0 && <p className="text-sm text-mist">Aucune note pour le moment.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-surface p-5">
            <h2 className="mb-4 font-semibold text-bone">Répartition des rôles</h2>
            <div className="flex flex-wrap gap-2">
              {analytics.roleBreakdown.map((r) => (
                <span
                  key={r.role}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-elevated px-3 py-1.5 text-xs text-bone"
                >
                  <ShieldCheck size={12} className="text-mist" />
                  {roleLabels[r.role] ?? r.role} · {r.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-bone">
            <MessageSquare size={18} className="text-prime" /> Commentaires récents
          </h2>
          <div className="rounded-lg border border-white/10 bg-surface divide-y divide-white/10">
            {recentComments.slice(0, 6).map((c: any) => (
              <div key={c.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm text-bone">{c.content}</p>
                  <p className="mt-1 text-xs text-mist">
                    {c.profiles?.full_name ?? c.profiles?.username ?? "Utilisateur"} · sur{" "}
                    <span className="text-gold">{c.titles?.title}</span>
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
                    c.is_hidden ? "bg-prime/20 text-prime-light" : "bg-green-500/15 text-green-400"
                  }`}
                >
                  {c.is_hidden ? "Masqué" : "Visible"}
                </span>
              </div>
            ))}
            {recentComments.length === 0 && <p className="p-6 text-center text-sm text-mist">Aucun commentaire pour le moment.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
