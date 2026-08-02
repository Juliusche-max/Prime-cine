"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

async function requireStaff(minRole: "moderator" | "admin" | "super_admin" = "moderator") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, profile: null };

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as any;
  const order = { moderator: 0, admin: 1, super_admin: 2 };
  const ok = !!profile && order[profile.role as keyof typeof order] >= order[minRole];
  return { supabase, ok, profile };
// ---------------------------------------------------------------------------
// Titles (movies & series)
// ---------------------------------------------------------------------------
export async function upsertTitleAction(formData: FormData): Promise<ActionResult> {
  const { supabase, ok, profile } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Le titre est obligatoire." };

  const payload = {
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title),
    original_title: String(formData.get("originalTitle") ?? "") || null,
    type: String(formData.get("type") ?? "movie"),
    is_original: formData.get("isOriginal") === "on",
    is_published: formData.get("isPublished") === "on",
    synopsis: String(formData.get("synopsis") ?? ""),
    short_synopsis: String(formData.get("shortSynopsis") ?? ""),
    poster_url: String(formData.get("posterUrl") ?? "") || null,
    backdrop_url: String(formData.get("backdropUrl") ?? "") || null,
    trailer_url: String(formData.get("trailerUrl") ?? "") || null,
    video_url: String(formData.get("videoUrl") ?? "") || null,
    age_rating: String(formData.get("ageRating") ?? "Tous publics"),
    duration_minutes: formData.get("durationMinutes") ? Number(formData.get("durationMinutes")) : null,
    duration_label: String(formData.get("durationLabel") ?? "") || null,
    release_year: formData.get("releaseYear") ? Number(formData.get("releaseYear")) : null,
    release_date: String(formData.get("releaseDate") ?? "") || null,
    director: String(formData.get("director") ?? "") || null,
    language: String(formData.get("language") ?? "Français"),
    country: String(formData.get("country") ?? "Cameroun"),
  };

  let titleId = id;
  if (id) {
    const { error } = await supabase.from("titles").update(payload as any).eq("id", id);
    if (error) return { error: "Impossible de mettre à jour ce titre : " + error.message };
  } else {
    const { data, error } = await supabase
      .from("titles")
      .insert({ ...payload, created_by: profile!.id } as any)
      .select("id")
      .single();
    if (error) return { error: "Impossible de créer ce titre : " + error.message };
    titleId = data.id;
  }

  // Sync genres (delete + re-insert is simplest/most correct for a small list)
  const genreIds = formData.getAll("genreIds").map(String).filter(Boolean);
  await supabase.from("title_genres").delete().eq("title_id", titleId);
  if (genreIds.length) {
    await supabase.from("title_genres").insert(genreIds.map((genre_id) => ({ title_id: titleId, genre_id })));
  }

  revalidatePath("/admin/movies");
  revalidatePath("/admin/series");
  redirect(payload.type === "movie" ? "/admin/movies" : "/admin/series");
}

export async function deleteTitleAction(id: string, type: string): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("admin");
  if (!ok) return { error: "Action non autorisée." };

  const { error } = await supabase.from("titles").delete().eq("id", id);
  if (error) return { error: "Suppression impossible : " + error.message };

  revalidatePath(type === "movie" ? "/admin/movies" : "/admin/series");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Episodes
// ---------------------------------------------------------------------------
export async function upsertEpisodeAction(formData: FormData): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const id = String(formData.get("id") ?? "");
  const titleId = String(formData.get("titleId") ?? "");
  const payload = {
    title_id: titleId,
    season_number: Number(formData.get("seasonNumber") ?? 1),
    episode_number: Number(formData.get("episodeNumber") ?? 1),
    title: String(formData.get("title") ?? ""),
    synopsis: String(formData.get("synopsis") ?? ""),
    duration_minutes: formData.get("durationMinutes") ? Number(formData.get("durationMinutes")) : null,
    thumbnail_url: String(formData.get("thumbnailUrl") ?? "") || null,
    video_url: String(formData.get("videoUrl") ?? "") || null,
    release_date: String(formData.get("releaseDate") ?? "") || null,
  };

  const { error } = id
    ? await supabase.from("episodes").update(payload).eq("id", id)
    : await supabase.from("episodes").insert(payload);

  if (error) return { error: "Erreur : " + error.message };
  revalidatePath(`/admin/series/${titleId}/edit`);
  return { success: true };
}

export async function deleteEpisodeAction(id: string, titleId: string): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const { error } = await supabase.from("episodes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/series/${titleId}/edit`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Users & administrators
// ---------------------------------------------------------------------------
export async function updateUserRoleAction(userId: string, role: string): Promise<ActionResult> {
  const { supabase, ok, profile } = await requireStaff("super_admin");
  if (!ok) return { error: "Seul un super administrateur peut modifier un rôle." };
  if (userId === profile!.id) return { error: "Vous ne pouvez pas modifier votre propre rôle." };

  const { error } = await supabase.from("profiles").update({ role } as any).eq("id", userId);
  if (error) return { error: "Impossible de modifier le rôle : " + error.message };

  revalidatePath("/admin/users");
  revalidatePath("/admin/administrators");
  return { success: true };
}

export async function toggleUserSuspensionAction(userId: string, suspend: boolean): Promise<ActionResult> {
  const { supabase, ok, profile } = await requireStaff("admin");
  if (!ok) return { error: "Action non autorisée." };
  if (userId === profile!.id) return { error: "Vous ne pouvez pas suspendre votre propre compte." };

  const { error } = await supabase.from("profiles").update({ is_suspended: suspend }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function promoteByEmailAction(formData: FormData): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("super_admin");
  if (!ok) return { error: "Seul un super administrateur peut ajouter un administrateur." };

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "moderator");
  if (!email) return { error: "Adresse email requise." };

  // Profiles don't store email directly; look the user up via auth admin API
  // is not available with the anon/server key, so we match on username as a
  // fallback convention (username defaults to the email's local part at signup).
  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .or(`username.ilike.${email.split("@")[0]}%`);

  if (!candidates || candidates.length === 0) {
    return { error: "Aucun compte trouvé. La personne doit d'abord créer un compte Prime Ciné." };
  }

  const { error } = await supabase.from("profiles").update({ role } as any).eq("id", candidates[0].id);
  if (error) return { error: error.message };

  revalidatePath("/admin/administrators");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Comments moderation
// ---------------------------------------------------------------------------
export async function setCommentVisibilityAction(id: string, isHidden: boolean): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const { error } = await supabase.from("comments").update({ is_hidden: isHidden }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/comments");
  return { success: true };
}

export async function deleteCommentAction(id: string): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/comments");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------
export async function upsertBannerAction(formData: FormData): Promise<ActionResult> {
  const { supabase, ok, profile } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const id = String(formData.get("id") ?? "");
  const payload = {
    heading: String(formData.get("heading") ?? "").trim(),
    subheading: String(formData.get("subheading") ?? ""),
    image_url: String(formData.get("imageUrl") ?? "").trim(),
    cta_label: String(formData.get("ctaLabel") ?? "Regarder"),
    title_id: String(formData.get("titleId") ?? "") || null,
    external_link: String(formData.get("externalLink") ?? "") || null,
    is_active: formData.get("isActive") === "on",
    sort_order: Number(formData.get("sortOrder") ?? 0),
  };

  if (!payload.heading || !payload.image_url) return { error: "Titre et image sont obligatoires." };

  const { error } = id
    ? await supabase.from("banners").update(payload).eq("id", id)
    : await supabase.from("banners").insert({ ...payload, created_by: profile!.id });

  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Subscription plans
// ---------------------------------------------------------------------------
export async function upsertPlanAction(formData: FormData): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("admin");
  if (!ok) return { error: "Action non autorisée." };

  const id = String(formData.get("id") ?? "");
  const featuresRaw = String(formData.get("features") ?? "");
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    tier: String(formData.get("tier") ?? "standard"),
    price_xaf: Number(formData.get("priceXaf") ?? 0),
    billing_period: String(formData.get("billingPeriod") ?? "monthly"),
    features: featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean),
    is_active: formData.get("isActive") === "on",
    sort_order: Number(formData.get("sortOrder") ?? 0),
  };

  if (!payload.name) return { error: "Le nom du plan est obligatoire." };

  const { error } = id
    ? await supabase.from("subscription_plans").update(payload as any).eq("id", id)
    : await supabase.from("subscription_plans").insert(payload as any);

  if (error) return { error: error.message };
  revalidatePath("/admin/subscriptions");
  return { success: true };
}

export async function deletePlanAction(id: string): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("admin");
  if (!ok) return { error: "Action non autorisée." };

  const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subscriptions");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Notifications (broadcast)
// ---------------------------------------------------------------------------
export async function sendNotificationAction(formData: FormData): Promise<ActionResult> {
  const { supabase, ok } = await requireStaff("moderator");
  if (!ok) return { error: "Action non autorisée." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const link = String(formData.get("link") ?? "") || null;
  const target = String(formData.get("target") ?? "all"); // "all" | username

  if (!title) return { error: "Le titre de la notification est obligatoire." };

  let userIds: string[] = [];
  if (target === "all") {
    const { data } = await supabase.from("profiles").select("id");
    userIds = (data ?? []).map((p) => p.id);
  } else {
    const { data } = await supabase.from("profiles").select("id").eq("username", target).maybeSingle();
    if (!data) return { error: "Utilisateur introuvable." };
    userIds = [data.id];
  }

  if (userIds.length === 0) return { error: "Aucun destinataire trouvé." };

  const rows = userIds.map((user_id) => ({ user_id, title, body, link }));
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/admin/notifications");
  return { success: true };
}
