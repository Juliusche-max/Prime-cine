"use client";

import { useState, useTransition } from "react";
import { setCommentVisibilityAction, deleteCommentAction } from "@/lib/supabase/admin-actions";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CommentModerationRow({ comment }: { comment: any }) {
  const [hidden, setHidden] = useState(comment.is_hidden);
  const [deleted, setDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="text-sm text-bone">{comment.content}</p>
        <p className="mt-1 text-xs text-mist">
          {comment.profiles?.full_name ?? comment.profiles?.username ?? "Utilisateur"} · sur{" "}
          <Link href={`/watch/${comment.titles?.slug}`} className="text-gold hover:underline">
            {comment.titles?.title}
          </Link>{" "}
          · {new Date(comment.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const next = !hidden;
              const result = await setCommentVisibilityAction(comment.id, next);
              if (!result?.error) setHidden(next);
            })
          }
          className="flex items-center gap-1 text-xs text-mist hover:text-bone disabled:opacity-40"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : hidden ? <Eye size={13} /> : <EyeOff size={13} />}
          {hidden ? "Afficher" : "Masquer"}
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteCommentAction(comment.id);
              if (!result?.error) setDeleted(true);
            })
          }
          className="flex items-center gap-1 text-xs text-mist hover:text-prime disabled:opacity-40"
        >
          <Trash2 size={13} /> Supprimer
        </button>
      </div>
    </div>
  );
}
