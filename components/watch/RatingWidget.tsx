"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { rateTitleAction } from "@/lib/supabase/content-actions";
import { cn } from "@/lib/utils";

export default function RatingWidget({ titleId }: { titleId: string }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRate(stars: number) {
    setSelected(stars);
    startTransition(async () => {
      const result = await rateTitleAction(titleId, stars * 2);
      if (!result?.error) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          disabled={isPending}
          aria-label={`Noter ${star} étoiles`}
          className="text-gold disabled:opacity-60"
        >
          <Star size={20} fill={(hovered || selected) >= star ? "currentColor" : "none"} className={cn((hovered || selected) < star && "text-mist/40")} />
        </button>
      ))}
      <span className="ml-2 text-xs text-mist">{selected ? "Merci pour votre note !" : "Notez ce titre"}</span>
    </div>
  );
}
