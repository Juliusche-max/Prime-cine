"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteButton({
  onDelete,
  confirmText = "Supprimer définitivement ?",
  label,
}: {
  onDelete: () => Promise<{ error?: string } | void>;
  confirmText?: string;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-mist">{confirmText}</span>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await onDelete();
              if (res?.error) {
                setError(res.error);
                setConfirming(false);
              }
            })
          }
          className="rounded bg-prime px-2 py-1 text-xs font-semibold text-white hover:bg-prime-light"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : "Oui"}
        </button>
        <button onClick={() => setConfirming(false)} className="rounded border border-white/15 px-2 py-1 text-xs text-mist hover:text-bone">
          Non
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-xs text-mist hover:text-prime transition-colors"
        aria-label="Supprimer"
      >
        <Trash2 size={14} /> {label}
      </button>
      {error && <p className="text-xs text-prime-light mt-1">{error}</p>}
    </>
  );
}
