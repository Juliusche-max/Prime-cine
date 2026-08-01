import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UserRow from "@/components/admin/UserRow";
import { listAdministrators } from "@/lib/supabase/admin-queries";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { promoteByEmailAction } from "@/lib/supabase/admin-actions";
import { redirect } from "next/navigation";
import PromoteForm from "@/components/admin/PromoteForm";

export default async function AdminAdministratorsPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "super_admin") redirect("/admin");

  const admins = await listAdministrators();

  return (
    <div>
      <AdminPageHeader
        title="Administrateurs"
        description="Gérez qui a accès au tableau de bord. Seul un super administrateur peut modifier ces rôles."
      />

      <div className="px-4 md:px-8 py-6 space-y-8">
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-5 max-w-lg">
          <h2 className="mb-3 font-semibold text-gold">Promouvoir un utilisateur existant</h2>
          <PromoteForm action={promoteByEmailAction} />
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-surface text-left text-mist">
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Membre depuis</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((u: any) => (
                <UserRow key={u.id} user={u} canEditRole={true} isSelf={u.id === profile?.id} />
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-mist">
                    Aucun administrateur pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
