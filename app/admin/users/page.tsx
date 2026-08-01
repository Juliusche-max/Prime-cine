import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UserRow from "@/components/admin/UserRow";
import { listUsers } from "@/lib/supabase/admin-queries";
import { getCurrentProfile } from "@/lib/supabase/queries";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [users, profile] = await Promise.all([listUsers(q), getCurrentProfile()]);
  const canEditRole = profile?.role === "super_admin";

  return (
    <div>
      <AdminPageHeader
        title="Utilisateurs"
        description={`${users.length} compte${users.length !== 1 ? "s" : ""} enregistré${users.length !== 1 ? "s" : ""}${!canEditRole ? " · connectez-vous en super administrateur pour modifier les rôles" : ""}`}
      />

      <div className="px-4 md:px-8 py-6">
        <form className="mb-5 max-w-sm">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un utilisateur..."
            className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
          />
        </form>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-surface text-left text-mist">
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Inscrit le</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u: any) => (
                <UserRow key={u.id} user={u} canEditRole={canEditRole} isSelf={u.id === profile?.id} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-mist">
                    Aucun utilisateur trouvé.
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
