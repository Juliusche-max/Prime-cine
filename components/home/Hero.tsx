"use client";

import { Title } from "@/lib/types";
import Button from "@/components/ui/Button";
import { Play, Plus, Info, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Hero({ titles }: { titles: Title[] }) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const active = titles[index];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % titles.length), 8000);
    return () => clearInterval(t);
  }, [titles.length]);

  return (
    <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 animate-kenburns">
            <Image
              src={active.backdropUrl}
              alt={active.title}
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-fade-up" />
          <div className="absolute inset-0 bg-fade-side" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full max-w-[1800px] mx-auto flex-col justify-end px-4 md:px-10 pb-16 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            {active.isOriginal && (
              <span className="mb-4 inline-block rounded bg-gold px-2 py-1 text-xs font-bold uppercase tracking-widest text-void">
                Prime Ciné Original
              </span>
            )}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] text-bone text-balance">
              {active.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-mist">
              <span className="flex items-center gap-1 text-gold font-semibold">★ {active.rating.toFixed(1)}</span>
              <span>{active.releaseYear}</span>
              <span className="rounded border border-mist/40 px-1.5 py-0.5 text-xs">{active.ageRating}</span>
              <span>{active.duration}</span>
              <span>{active.genres.slice(0, 2).join(" · ")}</span>
            </div>
            <p className="mt-4 line-clamp-3 text-base text-bone/90 leading-relaxed">
              {active.shortSynopsis || active.synopsis}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`/watch/${active.slug}`}>
                <Button variant="secondary" size="lg">
                  <Play size={20} fill="currentColor" /> Regarder
                </Button>
              </Link>
              <Button variant="ghost" size="lg">
                <Plus size={20} /> Ma Liste
              </Button>
              <Link href={`/watch/${active.slug}`}>
                <Button variant="outline" size="lg">
                  <Info size={20} /> Détails
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators + mute */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex gap-2">
            {titles.map((t, i) => (
              <button
                key={t.id}
                aria-label={`Voir ${t.title}`}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-prime" : "w-4 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            aria-label={muted ? "Activer le son" : "Couper le son"}
            onClick={() => setMuted((m) => !m)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-bone hover:border-white transition-colors"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </section>
  );
}
