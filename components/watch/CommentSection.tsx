"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCommentAction } from "@/lib/supabase/content-actions";
import { MessageSquare, Send } from "lucide-react";
import { Comment } from "@/lib/types";

export default function CommentSection({ titleId, comments }: { titleId: string; comments: Comment[] }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addCommentAction(titleId, content);
      if (result?.error) {
        setError(result.error);
      } else {
        setContent("");
        router.refresh();
      }
    });
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-medium text-bone">
        <MessageSquare size={20} className="text-prime" /> Commentaires ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Partagez votre avis..."
          maxLength={2000}
          className="flex-1 rounded-md border border-white/15 bg-elevated px-3 py-2.5 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="flex items-center gap-1.5 rounded-md bg-prime px-4 py-2.5 text-sm font-semibold text-white hover:bg-prime-light disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-prime-light" role="alert">{error}</p>}

      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prime to-gold text-xs font-bold text-white">
              {c.userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-bone">{c.userName}</p>
              <p className="text-sm text-mist mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-mist">Soyez le premier à commenter.</p>}
      </div>
    </div>
  );
}
