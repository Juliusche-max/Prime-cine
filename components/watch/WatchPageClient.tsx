"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import VideoPlayer from "@/components/player/VideoPlayer";
import { Title, Episode } from "@/lib/types";
import { Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressRow {
  episode_id: string | null;
  progress_seconds: number;
  duration_seconds: number;
  percent: number;
}

export default function WatchPageClient({ title, progressRows }: { title: Title; progressRows: ProgressRow[] }) {
  const isSeries = !!title.episodes && title.episodes.length > 0;
  const episodes = title.episodes ?? [];

  const progressByEpisode = useMemo(() => {
    const map = new Map<string | "movie", ProgressRow>();
    progressRows.forEach((r) => map.set(r.episode_id ?? "movie", r));
    return map;
  }, [progressRows]);

  const defaultEpisode = useMemo(() => {
    if (!isSeries) return null;
    const inProgress = episodes.find((e) => {
      const p = progressByEpisode.get(e.id);
      return p && p.percent > 0 && p.percent < 95;
    });
    return inProgress ?? episodes[0];
  }, [isSeries, episodes, progressByEpisode]);

  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(defaultEpisode);

  const activeVideoUrl = isSeries ? activeEpisode?.videoUrl : title.videoUrl;
  const activeProgress = isSeries
    ? progressByEpisode.get(activeEpisode?.id ?? "")
    : progressByEpisode.get("movie");

  const currentIndex = activeEpisode ? episodes.findIndex((e) => e.id === activeEpisode.id) : -1;
  const nextEpisode = isSeries && currentIndex >= 0 ? episodes[currentIndex + 1] : undefined;

  if (!activeVideoUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-elevated text-mist">
        <Lock size={28} />
        <p className="text-sm">
          {isSeries ? "Aucune vidéo n'a encore été téléversée pour cet épisode." : "Aucune vidéo n'a encore été téléversée pour ce titre."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <VideoPlayer
        key={activeVideoUrl}
        src={activeVideoUrl}
        poster={title.backdropUrl}
        titleId={title.id}
        episodeId={isSeries ? activeEpisode?.id ?? null : null}
        initialProgressSeconds={activeProgress?.progress_seconds ?? 0}
        nextEpisode={nextEpisode ? { id: nextEpisode.id, title: nextEpisode.title } : null}
        onNextEpisode={() => nextEpisode && setActiveEpisode(nextEpisode)}
      />

      {isSeries && (
        <div className="px-4 md:px-10 py-8">
          <h2 className="mb-4 font-display text-xl font-medium text-bone">Épisodes</h2>
          <div className="space-y-2">
            {episodes.map((ep) => {
              const p = progressByEpisode.get(ep.id);
              const active = activeEpisode?.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setActiveEpisode(ep)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-md border p-3 text-left transition-colors",
                    active ? "border-prime bg-prime/10" : "border-white/10 bg-surface hover:bg-elevated"
                  )}
                >
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-elevated2">
                    {ep.thumbnailUrl && <Image src={ep.thumbnailUrl} alt="" fill className="object-cover" />}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={18} className="text-white" fill="currentColor" />
                    </div>
                    {p && p.percent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-prime" style={{ width: `${p.percent}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium truncate", active ? "text-prime" : "text-bone")}>
                      S{ep.seasonNumber}E{ep.episodeNumber} — {ep.title}
                    </p>
                    <p className="mt-0.5 text-xs text-mist line-clamp-2">{ep.synopsis}</p>
                    <p className="mt-1 text-xs text-mist/70">{ep.duration}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
