"use client";

import { useState, useTransition } from "react";
import { sendNotificationAction } from "@/lib/supabase/admin-actions";
import Button from "@/components/ui/Button";
import { Send } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-white/15 bg-elevated px-3 py-2.5 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none";

export default function NotificationComposer() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [target, setTarget] = useState<"all" | "user">("all");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await sendNotificationAction(formData);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg rounded-lg border border-white/10 bg-surface p-5">
      {error && <p className="text-sm text-prime-light" role="alert">{error}</p>}
      {success && <p className="text-sm text-green-400">Notification envoyée avec succès.</p>}

      <div>
        <label className="mb-1.5 block text-sm text-mist">Titre *</label>
        <input name="title" required placeholder="Nouvel épisode disponible !" className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Message</label>
        <textarea name="body" rows={3} placeholder="L'épisode 5 de Zéro Couple est en ligne." className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Lien (optionnel)</label>
        <input name="link" placeholder="/watch/zero-couple" className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-mist">Destinataires</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-bone">
            <input type="radio" name="targetType" checked={target === "all"} onChange={() => setTarget("all")} className="accent-prime" />
            Tous les utilisateurs
          </label>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input type="radio" name="targetType" checked={target === "user"} onChange={() => setTarget("user")} className="accent-prime" />
            Un utilisateur précis
          </label>
        </div>
        {target === "all" ? (
          <input type="hidden" name="target" value="all" />
        ) : (
          <input name="target" placeholder="nom_utilisateur" className={`${inputClass} mt-2`} />
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        <Send size={15} /> {isPending ? "Envoi..." : "Envoyer la notification"}
      </Button>
    </form>
  );
}
