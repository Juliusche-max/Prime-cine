"use client";

import { Title } from "@/lib/types";
import { Play, Plus, Check, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleMyListAction } from "@/lib/supabase/content-actions";
import { useRouter } from "next/navigation";

interface MovieCardProps {
  title: Title;
  priority?: boolean;
  initiallyInList?: boolean;
}

export default function MovieCard({ title, priority = false, initiallyInList = false }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(initiallyInList);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <motion.div
      className="group relative w-[168px] sm:w-[196px] md:w-[220px] shrink-0 select-none"
      whileHover={{ scale: 1.06, zIndex: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link href={`/watch/${title.slug}`} aria-label={`Voir ${title.title}`}>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-elevated stub-corner ring-1 ring-white/5 group-hover:ring-prime/60 transition-all">
          <Image
            src={title.posterUrl}
            alt={title.title}
            fill
            sizes="220px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {title.isOriginal && (
            <span className="absolute left-2 top-2 rounded bg-gold/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-void">
              Original
            </span>
          )}

          {/* progress bar for continue watching */}
          {typeof title.progress === "number" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-prime"
                style={{ width: `${title.progress}%` }}
              />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <button
                aria-label="Regarder"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-bone text-void hover:bg-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Play size={14} fill="currentColor" />
              </button>
              <button
                aria-label={isFavorite ? "Retirer de ma liste" : "Ajouter à ma liste"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const next = !isFavorite;
                  setIsFavorite(next);
                  startTransition(async () => {
                    const result = await toggleMyListAction(title.id);
                    if (result.error) {
                      setIsFavorite(!next);
                      router.push("/login");
                    } else {
                      setIsFavorite(result.added);
                    }
                  });
                }}
                disabled={isPending}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-colors disabled:opacity-60",
                  isFavorite
                    ? "border-prime bg-prime text-white"
                    : "border-white/40 bg-black/40 text-bone hover:border-white"
                )}
              >
                {isFavorite ? <Check size={14} /> : <Plus size={14} />}
              </button>
            </div>
            <p className="text-[13px] font-semibold leading-tight text-bone line-clamp-2">
              {title.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-mist">
              <span className="flex items-center gap-0.5 text-gold">
                <Star size={10} fill="currentColor" /> {title.rating.toFixed(1)}
              </span>
              <span>{title.releaseYear}</span>
              <span>{title.duration}</span>
            </div>
          </div>
        </div>
      </Link>
      <p className="mt-2 truncate text-sm text-mist group-hover:text-bone transition-colors md:hidden">
        {title.title}
      </p>
    </motion.div>
  );
}
