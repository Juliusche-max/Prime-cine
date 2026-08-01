import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getTitleBySlug, getRecommendedTitles, isInMyList, getMyProgressForTitle } from "@/lib/supabase/queries";
import WatchPageClient from "@/components/watch/WatchPageClient";
import MyListButton from "@/components/watch/MyListButton";
import RatingWidget from "@/components/watch/RatingWidget";
import CommentSection from "@/components/watch/CommentSection";
import MovieRow from "@/components/home/MovieRow";
import { Star, Clock, Calendar, Globe } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: slug } = await params;
  const title = await getTitleBySlug(slug);
  if (!title) return { title: "Titre introuvable" };

  const description = title.shortSynopsis || title.synopsis.slice(0, 155);
  return {
    title: title.title,
    description,
    openGraph: {
      title: title.title,
      description,
      images: title.backdropUrl ? [{ url: title.backdropUrl, width: 1280, height: 720, alt: title.title }] : undefined,
      type: "video.movie",
    },
    twitter: {
      card: "summary_large_image",
      title: title.title,
      description,
      images: title.backdropUrl ? [title.backdropUrl] : undefined,
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const title = await getTitleBySlug(slug);
  if (!title) notFound();

  const [recommended, inList, progressRows] = await Promise.all([
    getRecommendedTitles(title.id, 12),
    isInMyList(title.id),
    getMyProgressForTitle(title.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": title.episodes && title.episodes.length > 0 ? "TVSeries" : "Movie",
    name: title.title,
    description: title.synopsis,
    image: title.posterUrl,
    dateCreated: title.releaseDate || undefined,
    genre: title.genres,
    director: title.director ? { "@type": "Person", name: title.director } : undefined,
    actor: title.cast.map((c) => ({ "@type": "Person", name: c.name })),
    aggregateRating:
      title.rating > 0
        ? { "@type": "AggregateRating", ratingValue: title.rating, bestRating: 10, ratingCount: title.comments?.length || 1 }
        : undefined,
    inLanguage: title.language,
    countryOfOrigin: title.country,
  };

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pt-16 md:pt-20">
        <WatchPageClient title={title} progressRows={progressRows as any} />
      </div>

      <div className="px-4 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {title.isOriginal && (
                <span className="rounded bg-gold px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-void">
                  Prime Ciné Original
                </span>
              )}
              <span className="rounded border border-mist/40 px-1.5 py-0.5 text-xs text-mist">{title.ageRating}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-bone">{title.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-mist">
              <span className="flex items-center gap-1 text-gold font-semibold">
                <Star size={14} fill="currentColor" /> {title.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {title.releaseYear}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {title.duration}</span>
              <span className="flex items-center gap-1"><Globe size={14} /> {title.language}</span>
              <span>{title.genres.join(" · ")}</span>
            </div>

            <p className="mt-5 leading-relaxed text-bone/90">{title.synopsis}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MyListButton titleId={title.id} initiallyInList={inList} />
            </div>

            <div className="mt-5">
              <RatingWidget titleId={title.id} />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-5">
              <div>
                <dt className="text-mist">Réalisateur</dt>
                <dd className="text-bone mt-0.5">{title.director || "—"}</dd>
              </div>
              <div>
                <dt className="text-mist">Pays</dt>
                <dd className="text-bone mt-0.5">{title.country}</dd>
              </div>
            </dl>
          </div>

          {title.cast.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-xl font-medium text-bone">Distribution</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {title.cast.map((c) => (
                  <div key={c.id} className="w-24 shrink-0 text-center">
                    <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded-full bg-elevated2">
                      {c.photoUrl && <Image src={c.photoUrl} alt={c.name} fill className="object-cover" />}
                    </div>
                    <p className="text-xs font-medium text-bone truncate">{c.name}</p>
                    <p className="text-[11px] text-mist truncate">{c.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CommentSection titleId={title.id} comments={title.comments ?? []} />
        </div>

        <aside>
          <div className="relative aspect-[2/3] w-full max-w-xs overflow-hidden rounded-lg mb-4">
            <Image src={title.posterUrl} alt={title.title} fill className="object-cover" />
          </div>
        </aside>
      </div>

      {recommended.length > 0 && (
        <div className="mt-4">
          <MovieRow row={{ id: "related", title: "Titres similaires", titles: recommended }} />
        </div>
      )}
    </div>
  );
}
