"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelMySubscriptionAction, resumeMySubscriptionAction } from "@/lib/supabase/payment-actions";
import { Loader2 } from "lucide-react";

export default function SubscriptionControls({
  subscriptionId,
  cancelAtPeriodEnd,
}: {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelMySubscriptionAction(subscriptionId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleResume() {
    setError(null);
    startTransition(async () => {
      const result = await resumeMySubscriptionAction(subscriptionId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div>
      {cancelAtPeriodEnd ? (
        <button
          onClick={handleResume}
          disabled={isPending}
          className="rounded-md border border-gold/40 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="inline animate-spin" /> : "Réactiver l'abonnement"}
        </button>
      ) : (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-md border border-white/15 px-4 py-2 text-sm text-mist hover:border-prime hover:text-prime disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="inline animate-spin" /> : "Annuler l'abonnement"}
        </button>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-prime-light">{error}</p>}
    </div>
  );
}
