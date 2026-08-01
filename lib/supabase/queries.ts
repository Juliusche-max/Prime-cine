import { createClient } from "@/lib/supabase/server";
import { Title, Row, Genre, CastMember, Episode, Comment } from "@/lib/types";
import { catalog as fallbackCatalog, getRows as getFallbackRows, getTitleBySlug as getFallbackTitle } from "@/lib/data";

const DEFAULT_RATING_IF_UNRATED = 8.0;

// The DB starts with zero votes on fresh titles; we show a friendly
// placeholder score until real ratings come in, rather than "0.0".
function displayRating(average: number, count: number) {
  return count > 0 ? average : DEFAULT_RATING_IF_UNRATED;
}

function mapDbRowToTitle(row: any): Title {
  const genreNames: string[] = (row.title_genres ?? [])
    .map((tg: any) => tg.genres?.name)
    .filter(Boolean);

  const cast: CastMember[] = (row.cast_members ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((c: any) => ({ id: c.id, name: c.name, role: c.role_name, photoUrl: c.photo_url ?? "" }));

  const episodes: Episode[] = (row.episodes ?? [])
    .sort((a: any, b: any) => a.episode_number - b.episode_number)
    .map((e: any) => ({
      id: e.id,
      episodeNumber: e.episode_number,
      seasonNumber: e.season_number,
      title: e.title,
      synopsis: e.synopsis,
      duration: e.duration_minutes ? `${e.duration_minutes} min` : "",
      thumbnailUrl: e.thumbnail_url ?? "",
      videoUrl: e.video_url ?? undefined,
      releaseDate: e.release_date ?? "",
    }));

  const comments: Comment[] = (row.comments ?? [])
    .filter((c: any) => !c.is_hidden)
    .map((c: any) => ({
      id: c.id,
      userName: c.profiles?.username ?? c.profiles?.full_name ?? "Utilisateur",
      avatarUrl: c.profiles?.avatar_url ?? "",
      content: c.content,
      rating: 0,
      createdAt: c.created_at,
    }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    originalTitle: row.original_title ?? undefined,
    type: row.type,
    isOriginal: row.is_original,
    synopsis: row.synopsis,
    shortSynopsis: row.short_synopsis,
    posterUrl: row.poster_url ?? "",
    backdropUrl: row.backdrop_url ?? "",
    trailerUrl: row.trailer_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    rating: displayRating(Number(row.average_rating ?? 0), Number(row.ratings_count ?? 0)),
    ageRating: row.age_rating,
    duration: row.duration_label ?? (row.duration_minutes ? `${row.duration_minutes} min` : ""),
    releaseYear: row.release_year ?? new Date().getFullYear(),
    releaseDate: row.release_date ?? "",
    genres: genreNames as Genre[],
    director: row.director ?? "",
    cast,
    language: row.language,
    country: row.country,
    episodes: episodes.length ? episodes : undefined,
    comments: comments.length ? comments : undefined,
  };
}

const TITLE_SELECT = `
  *,
  title_genres ( genres ( name ) ),
  cast_members ( id, name, role_name, photo_url, sort_order ),
  episodes ( id, season_number, episode_number, title, synopsis, duration_minutes, thumbnail_url, release_date ),
  comments ( id, content, is_hidden, created_at, profiles ( username, full_name, avatar_url ) )
`;

/** All published titles, richly joined. Falls back to static demo data if Supabase isn't configured or the query fails. */
export async function getPublishedTitles(): Promise<Title[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return fallbackCatalog;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("titles")
      .select(TITLE_SELECT)
      .eq("is_published", true)
      .order("release_date", { ascending: false });

    if (error || !data || data.length === 0) return fallbackCatalog;
    return data.map(mapDbRowToTitle);
  } catch {
    return fallbackCatalog;
  }
}

export async function getTitleBySlug(slug: string): Promise<Title | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return getFallbackTitle(slug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("titles")
      .select(TITLE_SELECT)
      .eq("slug", slug)
      .single();

    if (error || !data) return getFallbackTitle(slug);
    return mapDbRowToTitle(data);
  } catch {
    return getFallbackTitle(slug);
  }
}

/** Builds the homepage rows from live data; identical shape to the static demo rows. */
export async function getHomeRows(): Promise<Row[]> {
  const titles = await getPublishedTitles();
  if (titles === fallbackCatalog) return getFallbackRows();

  const originals = titles.filter((t) => t.isOriginal);
  const byGenre = (g: string) => titles.filter((t) => t.genres.includes(g as any));

  return [
    { id: "trending", title: "Tendances du moment", titles: titles.slice(0, 8) },
    { id: "new", title: "Nouveautés", titles: [...titles].reverse().slice(0, 8) },
    { id: "originals", title: "Prime Ciné Originals", titles: originals },
    { id: "popular", title: "Les plus populaires", titles: [...titles].sort((a, b) => b.rating - a.rating).slice(0, 8) },
    { id: "action", title: "Action", titles: byGenre("Action") },
    { id: "comedy", title: "Comédie", titles: byGenre("Comédie") },
    { id: "drama", title: "Drame", titles: byGenre("Drame") },
    { id: "romance", title: "Romance", titles: byGenre("Romance") },
    { id: "docs", title: "Documentaires", titles: titles.filter((t) => t.type === "documentary") },
    { id: "reality", title: "Télé-réalité", titles: titles.filter((t) => t.type === "reality") },
  ].filter((r) => r.titles.length > 0);
}

/** The signed-in user's "My List" titles. */
export async function getMyListTitles(): Promise<Title[]> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const { data, error } = await supabase
      .from("my_list")
      .select(`title_id, titles ( ${TITLE_SELECT} )`)
      .eq("user_id", auth.user.id);

    if (error || !data) return [];
    return data.map((row: any) => mapDbRowToTitle(row.titles)).filter(Boolean);
  } catch {
    return [];
  }
}

/** The signed-in user's in-progress titles for Continue Watching. */
export async function getContinueWatchingTitles(): Promise<Title[]> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const { data, error } = await supabase
      .from("watch_progress")
      .select(`percent, updated_at, titles ( ${TITLE_SELECT} )`)
      .eq("user_id", auth.user.id)
      .gt("percent", 0)
      .lt("percent", 98)
      .order("updated_at", { ascending: false });

    if (error || !data) return [];
    return data
      .map((row: any) => {
        const t = mapDbRowToTitle(row.titles);
        return t ? { ...t, progress: Number(row.percent) } : null;
      })
      .filter(Boolean) as Title[];
  } catch {
    return [];
  }
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
    return data ? { ...data, email: auth.user.email } : null;
  } catch {
    return null;
  }
}

/** Genre-based "Recommended for you": looks at the signed-in user's My List +
 * watch history, finds their most-watched genres, and suggests other titles
 * sharing those genres (excluding ones already in their list/history).
 * Falls back to top-rated titles for signed-out users or those with no history. */
export async function getRecommendedTitles(excludeId?: string, limit = 12): Promise<Title[]> {
  const allTitles = await getPublishedTitles();

  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      return [...allTitles].sort((a, b) => b.rating - a.rating).filter((t) => t.id !== excludeId).slice(0, limit);
    }

    const [{ data: listRows }, { data: progressRows }] = await Promise.all([
      supabase.from("my_list").select("title_id").eq("user_id", auth.user.id),
      supabase.from("watch_progress").select("title_id").eq("user_id", auth.user.id),
    ]);

    const interactedIds = new Set([...(listRows ?? []).map((r) => r.title_id), ...(progressRows ?? []).map((r) => r.title_id)]);
    if (interactedIds.size === 0) {
      return [...allTitles].sort((a, b) => b.rating - a.rating).filter((t) => t.id !== excludeId).slice(0, limit);
    }

    const interactedTitles = allTitles.filter((t) => interactedIds.has(t.id));
    const genreScore = new Map<string, number>();
    interactedTitles.forEach((t) => t.genres.forEach((g) => genreScore.set(g, (genreScore.get(g) ?? 0) + 1)));

    const scored = allTitles
      .filter((t) => !interactedIds.has(t.id) && t.id !== excludeId)
      .map((t) => ({
        title: t,
        score: t.genres.reduce((sum, g) => sum + (genreScore.get(g) ?? 0), 0) + t.rating / 10,
      }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.title);
  } catch {
    return allTitles.filter((t) => t.id !== excludeId).slice(0, limit);
  }
}

export interface WatchHistoryEntry {
  title: Title;
  percent: number;
  updatedAt: string;
  completed: boolean;
}

/** Full watch history (in-progress AND completed), most recent first. */
export async function getWatchHistory(): Promise<WatchHistoryEntry[]> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const { data, error } = await supabase
      .from("watch_progress")
      .select(`percent, updated_at, titles ( ${TITLE_SELECT} )`)
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data
      .map((row: any) => {
        const t = mapDbRowToTitle(row.titles);
        if (!t) return null;
        return { title: t, percent: Number(row.percent), updatedAt: row.updated_at, completed: Number(row.percent) >= 95 };
      })
      .filter(Boolean) as WatchHistoryEntry[];
  } catch {
    return [];
  }
}

export async function isInMyList(titleId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data } = await supabase
      .from("my_list")
      .select("title_id")
      .eq("user_id", auth.user.id)
      .eq("title_id", titleId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getMyProgressForTitle(titleId: string) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data } = await supabase
      .from("watch_progress")
      .select("episode_id, progress_seconds, duration_seconds, percent")
      .eq("user_id", auth.user.id)
      .eq("title_id", titleId);
    return data ?? [];
  } catch {
    return [];
  }
}
