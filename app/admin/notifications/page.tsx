import AdminPageHeader from "@/components/admin/AdminPageHeader";
import NotificationComposer from "@/components/admin/NotificationComposer";
import { listSentNotifications } from "@/lib/supabase/admin-queries";
import { Bell } from "lucide-react";

export default async function AdminNotificationsPage() {
  const sent = await listSentNotifications();

  return (
    <div>
      <AdminPageHeader title="Notifications" description="Envoyez une notification à tous les utilisateurs ou à une personne précise." />

      <div className="px-4 md:px-8 py-6 space-y-10">
        <NotificationComposer />

        <div>
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-bone">
            <Bell size={18} className="text-prime" /> Historique des envois
          </h2>
          <div className="rounded-lg border border-white/10 bg-surface divide-y divide-white/10">
            {sent.map((n, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-bone">{n.title}</p>
                  {n.body && <p className="text-xs text-mist mt-0.5">{n.body}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gold">{n.recipients} destinataire{n.recipients !== 1 ? "s" : ""}</p>
                  <p className="text-[11px] text-mist">{new Date(n.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            ))}
            {sent.length === 0 && <p className="p-8 text-center text-sm text-mist">Aucune notification envoyée pour le moment.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
