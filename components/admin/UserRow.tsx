"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction, toggleUserSuspensionAction } from "@/lib/supabase/admin-actions";
import { Loader2 } from "lucide-react";

const roles = ["user", "moderator", "admin", "super_admin"];
const roleLabels: Record<string, string> = {
  user: "Utilisateur",
  moderator: "Modérateur",
  admin: "Administrateur",
  super_admin: "Super Admin",
};

export default function UserRow({
  user,
  canEditRole,
  isSelf,
}: {
  user: { id: string; full_name: string | null; username: string | null; role: string; is_suspended: boolean; created_at: string };
  canEditRole: boolean;
  isSelf: boolean;
}) {
  const [role, setRole] = useState(user.role);
  const [suspended, setSuspended] = useState(user.is_suspended);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="bg-surface/40 hover:bg-surface transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-bone">{user.full_name ?? "—"}</p>
        <p className="text-xs text-mist">@{user.username ?? "?"}</p>
      </td>
      <td className="px-4 py-3 text-mist text-xs">
        {new Date(user.created_at).toLocaleDateString("fr-FR")}
      </td>
      <td className="px-4 py-3">
        {canEditRole ? (
          <select
            value={role}
            disabled={isPending || isSelf}
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);
              setError(null);
              startTransition(async () => {
                const result = await updateUserRoleAction(user.id, newRole);
                if (result?.error) {
                  setError(result.error);
                  setRole(user.role);
                }
              });
            }}
            className="rounded border border-white/15 bg-elevated px-2 py-1 text-xs text-bone focus:border-prime focus:outline-none disabled:opacity-50"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-mist">{roleLabels[role]}</span>
        )}
        {error && <p className="mt-1 text-[11px] text-prime-light" role="alert">{error}</p>}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded px-2 py-1 text-xs font-medium ${suspended ? "bg-prime/20 text-prime-light" : "bg-green-500/15 text-green-400"}`}>
          {suspended ? "Suspendu" : "Actif"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          disabled={isPending || isSelf}
          onClick={() =>
            startTransition(async () => {
              const next = !suspended;
              const result = await toggleUserSuspensionAction(user.id, next);
              if (!result?.error) setSuspended(next);
              else setError(result.error ?? null);
            })
          }
          className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-prime disabled:opacity-40"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {suspended ? "Réactiver" : "Suspendre"}
        </button>
      </td>
    </tr>
  );
}
