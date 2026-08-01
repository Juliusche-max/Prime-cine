import { createClient } from "@/lib/supabase/server";

const TITLE_ADMIN_SELECT = `
  *,
  title_genres ( genre_id, genres ( id, name ) ),
  episodes ( id, season_number, episode_number, title, synopsis, duration_minutes, thumbnail_url, video_url, release_date )
`;

export async function listTitlesForAdmin(search?: string): Promise<any[]> {
  const supabase = await createClient();
  let query = supabase.from("titles").select(TITLE_ADMIN_SELECT).order("created_at", { ascending: false });
  if (search) query = query.ilike("title", `%${search}%`);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as any[];
}

export async function getTitleForAdmin(id: string): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("titles").select(TITLE_ADMIN_SELECT).eq("id", id).single();
  if (error) return null;
  return data as any;
}

export async function listAllGenres() {
  const supabase = await createClient();
  const { data } = await supabase.from("genres").select("*").order("name");
  return data ?? [];
}

export async function listUsers(search?: string) {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (search) query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function listAdministrators() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["moderator", "admin", "super_admin"])
    .order("role");
  if (error) return [];
  return data;
}

export async function listCommentsForModeration(filter: "all" | "hidden" | "visible" = "all"): Promise<any[]> {
  const supabase = await createClient();
  let query = supabase
    .from("comments")
    .select("*, titles ( title, slug ), profiles ( username, full_name, avatar_url )")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filter === "hidden") query = query.eq("is_hidden", true);
  if (filter === "visible") query = query.eq("is_hidden", false);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as any[];
}

export async function listBanners(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*, titles ( title, slug )")
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as any[];
}

export async function getBanner(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").eq("id", id).single();
  return data;
}

export async function listPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subscription_plans").select("*").order("sort_order");
  if (error) return [];
  return data;
}

export async function listUserSubscriptions(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*, profiles ( full_name, username ), subscription_plans ( name, tier, price_xaf )")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return (data ?? []) as any[];
}

export async function listSentNotifications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, link, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return [];

  const groups = new Map<string, { title: string; body: string; link: string | null; created_at: string; recipients: number }>();
  for (const n of data) {
    const key = `${n.title}__${n.body}__${n.created_at}`;
    const existing = groups.get(key);
    if (existing) existing.recipients += 1;
    else groups.set(key, { title: n.title, body: n.body, link: n.link, created_at: n.created_at, recipients: 1 });
  }
  return Array.from(groups.values());
}

export interface AnalyticsSnapshot {
  totalUsers: number;
  totalTitles: number;
  totalComments: number;
  totalRatings: number;
  activeSubscriptions: number;
  usersByDay: { day: string; count: number }[];
  titlesByType: { type: string; count: number }[];
  topRated: { title: string; average_rating: number; ratings_count: number }[];
  roleBreakdown: { role: string; count: number }[];
}

export async function getAnalytics(): Promise<AnalyticsSnapshot> {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalTitles },
    { count: totalComments },
    { count: totalRatings },
    { count: activeSubscriptions },
    { data: profiles },
    { data: titles },
    { data: topRated },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("titles").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("ratings").select("*", { count: "exact", head: true }),
    supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("created_at, role"),
    supabase.from("titles").select("type"),
    supabase
      .from("titles")
      .select("title, average_rating, ratings_count")
      .order("average_rating", { ascending: false })
      .limit(5),
  ]);

  const usersByDayMap = new Map<string, number>();
  (profiles ?? []).forEach((p) => {
    const day = new Date(p.created_at).toISOString().slice(0, 10);
    usersByDayMap.set(day, (usersByDayMap.get(day) ?? 0) + 1);
  });
  const usersByDay = Array.from(usersByDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, count]) => ({ day: day.slice(5), count }));

  const roleBreakdownMap = new Map<string, number>();
  (profiles ?? []).forEach((p) => roleBreakdownMap.set(p.role, (roleBreakdownMap.get(p.role) ?? 0) + 1));
  const roleBreakdown = Array.from(roleBreakdownMap.entries()).map(([role, count]) => ({ role, count }));

  const typeMap = new Map<string, number>();
  (titles ?? []).forEach((t) => typeMap.set(t.type, (typeMap.get(t.type) ?? 0) + 1));
  const titlesByType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));

  return {
    totalUsers: totalUsers ?? 0,
    totalTitles: totalTitles ?? 0,
    totalComments: totalComments ?? 0,
    totalRatings: totalRatings ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    usersByDay,
    titlesByType,
    topRated: topRated ?? [],
    roleBreakdown,
  };
}
