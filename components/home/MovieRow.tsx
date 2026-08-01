"use client";

import { Row } from "@/lib/types";
import MovieCard from "@/components/ui/MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

export default function MovieRow({ row, priority = false }: { row: Row; priority?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (scrollRef.current) setShowLeft(scrollRef.current.scrollLeft > 20);
  };

  if (row.titles.length === 0) return null;

  return (
    <section className="relative py-2" aria-label={row.title}>
      <h2 className="mb-3 px-4 md:px-10 font-display text-xl md:text-2xl font-medium text-bone">
        {row.title}
      </h2>

      <div className="group/row relative">
        {showLeft && (
          <button
            aria-label="Précédent"
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 z-30 hidden h-full w-10 md:w-14 items-center justify-center bg-gradient-to-r from-void to-transparent text-bone opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="row-scroll flex gap-3 overflow-x-auto px-4 md:px-10 pb-2 scroll-smooth"
        >
          {row.titles.map((title, i) => (
            <MovieCard key={title.id + i} title={title} priority={priority && i < 4} />
          ))}
        </div>

        <button
          aria-label="Suivant"
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 z-30 hidden h-full w-10 md:w-14 items-center justify-center bg-gradient-to-l from-void to-transparent text-bone opacity-0 transition-opacity group-hover/row:opacity-100 md:flex"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </section>
  );
}
