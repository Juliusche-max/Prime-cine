"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  SkipForward,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertWatchProgressAction } from "@/lib/supabase/content-actions";

interface NextEpisodeInfo {
  id: string;
  title: string;
  thumbnailUrl?: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  titleId: string;
  episodeId?: string | null;
  initialProgressSeconds?: number;
  nextEpisode?: NextEpisodeInfo | null;
  onNextEpisode?: () => void;
  subtitleUrl?: string | null;
}

const QUALITIES = ["Auto", "1080p", "720p", "480p", "360p"];

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function VideoPlayer({
  src,
  poster,
  titleId,
  episodeId = null,
  initialProgressSeconds = 0,
  nextEpisode,
  onNextEpisode,
  subtitleUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgressSeconds);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [showSettings, setShowSettings] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Seek to saved progress once metadata is loaded
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => {
      if (initialProgressSeconds > 0 && initialProgressSeconds < v.duration - 10) {
        v.currentTime = initialProgressSeconds;
      }
      setDuration(v.duration);
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Persist progress every 10s and on unmount/pause
  const persist = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    upsertWatchProgressAction(titleId, episodeId, v.currentTime, v.duration);
  }, [titleId, episodeId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) persist();
    }, 10000);
    return () => {
      clearInterval(interval);
      persist();
    };
  }, [persist]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
      if (v.duration && v.duration - v.currentTime < 20 && nextEpisode) setShowNextOverlay(true);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      persist();
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => {
      persist();
      if (nextEpisode && onNextEpisode) onNextEpisode();
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", onEnded);
    };
  }, [persist, nextEpisode, onNextEpisode]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  function seekBy(seconds: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + seconds), v.duration || 0);
  }

  function handleSeekBar(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
    v.muted = val === 0;
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  }

  function resetHideTimer() {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }

  useEffect(() => {
    setVideoError(null);
  }, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onError = () => setVideoError("Cette vidéo n'a pas pu être chargée. Vérifiez votre connexion ou réessayez plus tard.");
    v.addEventListener("error", onError);
    return () => v.removeEventListener("error", onError);
  }, [src]);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (videoError) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-black text-mist px-4 text-center">
        <p className="text-sm">{videoError}</p>
        <button
          onClick={() => {
            setVideoError(null);
            videoRef.current?.load();
          }}
          className="rounded-md bg-prime px-4 py-2 text-sm font-semibold text-white hover:bg-prime-light"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden bg-black select-none"
      onMouseMove={resetHideTimer}
      onClick={() => (showSettings ? setShowSettings(false) : togglePlay())}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        onDoubleClick={toggleFullscreen}
        playsInline
      >
        {subtitleUrl && (
          <track kind="subtitles" src={subtitleUrl} srcLang="fr" label="Français" default={subtitlesOn} />
        )}
      </video>

      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 size={44} className="animate-spin text-white/80" />
        </div>
      )}

      {!isPlaying && !isBuffering && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label="Lecture"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-prime/90 text-white shadow-xl hover:bg-prime transition-colors">
            <Play size={28} fill="currentColor" className="ml-1" />
          </span>
        </button>
      )}

      {/* Next episode overlay */}
      {showNextOverlay && nextEpisode && (
        <div className="absolute bottom-24 right-4 z-20 w-64 rounded-md border border-white/10 bg-surface/95 p-3 shadow-xl">
          <p className="text-xs text-mist mb-2">Épisode suivant</p>
          <p className="text-sm font-medium text-bone mb-3 truncate">{nextEpisode.title}</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNextOverlay(false);
                onNextEpisode?.();
              }}
              className="flex items-center gap-1.5 rounded bg-prime px-3 py-1.5 text-xs font-semibold text-white hover:bg-prime-light"
            >
              <SkipForward size={13} /> Lire maintenant
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNextOverlay(false);
              }}
              className="rounded border border-white/15 px-3 py-1.5 text-xs text-mist hover:text-bone"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seek bar */}
        <div className="relative mb-2 h-1.5 w-full rounded-full bg-white/20">
          <div className="absolute h-full rounded-full bg-white/40" style={{ width: `${(buffered / (duration || 1)) * 100}%` }} />
          <div className="absolute h-full rounded-full bg-prime" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeekBar}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Progression de la vidéo"
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Lecture"}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={() => seekBy(-10)} aria-label="Reculer de 10 secondes">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => seekBy(10)} aria-label="Avancer de 10 secondes">
              <RotateCw size={18} />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} aria-label="Volume">
                <VolumeIcon size={18} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="w-0 group-hover/vol:w-16 transition-all accent-prime"
                aria-label="Niveau du volume"
              />
            </div>

            <span className="text-xs text-white/80 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {nextEpisode && (
              <button onClick={() => onNextEpisode?.()} aria-label="Épisode suivant" className="hidden sm:block">
                <SkipForward size={18} />
              </button>
            )}
            <button
              onClick={() => setSubtitlesOn((s) => !s)}
              aria-label="Sous-titres"
              className={subtitlesOn ? "text-prime" : ""}
            >
              <Subtitles size={18} />
            </button>
            <div className="relative">
              <button onClick={() => setShowSettings((s) => !s)} aria-label="Qualité vidéo">
                <Settings size={18} />
              </button>
              {showSettings && (
                <div className="absolute bottom-8 right-0 w-32 rounded-md border border-white/10 bg-surface py-1 shadow-xl">
                  <p className="px-3 py-1 text-[10px] uppercase text-mist">Qualité</p>
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowSettings(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-1.5 text-left text-xs hover:bg-elevated",
                        quality === q ? "text-prime" : "text-bone"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} aria-label="Plein écran">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
