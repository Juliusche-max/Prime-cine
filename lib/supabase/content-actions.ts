"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function toggleMyListAction(titleId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour ajouter à votre liste.", added: false };

  const { data: existing } = await supabase
    .from("my_list")
    .select("title_id")
    .eq("user_id", user.id)
    .eq("title_id", titleId)
    .maybeSingle();

  if (existing) {
    await supabase.from("my_list").delete().eq("user_id", user.id).eq("title_id", titleId);
    revalidatePath("/my-list");
    return { added: false };
  }

  await supabase.from("my_list").insert({ user_id: user.id, title_id: titleId });
  revalidatePath("/my-list");
  return { added: true };
}

export async function addCommentAction(titleId: string, content: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour commenter." };
  if (!content.trim()) return { error: "Le commentaire ne peut pas être vide." };
  if (content.length > 2000) return { error: "Le commentaire est trop long (2000 caractères maximum)." };

  const { allowed } = checkRateLimit(`comment:${user.id}`, 5, 60 * 1000);
  if (!allowed) return { error: "Vous publiez trop rapidement. Merci de patienter un instant." };

  const { error } = await supabase
    .from("comments")
    .insert({ title_id: titleId, user_id: user.id, content: content.trim() });

  if (error) return { error: "Impossible de publier le commentaire." };
  revalidatePath("/watch/[id]", "page");
  return { success: true };
}

export async function rateTitleAction(titleId: string, score: number) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour noter ce titre." };

  const { error } = await supabase
    .from("ratings")
    .upsert({ title_id: titleId, user_id: user.id, score }, { onConflict: "title_id,user_id" });

  if (error) return { error: "Impossible d'enregistrer votre note." };
  revalidatePath("/watch/[id]", "page");
  return { success: true };
}

export async function upsertWatchProgressAction(
  titleId: string,
  episodeId: string | null,
  progressSeconds: number,
  durationSeconds: number
) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Non authentifié." };

  const percent = durationSeconds > 0 ? Math.min(100, (progressSeconds / durationSeconds) * 100) : 0;

  const { error } = await supabase.from("watch_progress").upsert(
    {
      user_id: user.id,
      title_id: titleId,
      episode_id: episodeId,
      progress_seconds: Math.floor(progressSeconds),
      duration_seconds: Math.floor(durationSeconds),
      percent,
    },
    { onConflict: "user_id,title_id,episode_id" }
  );

  if (error) return { error: "Impossible d'enregistrer la progression." };
  return { success: true };
}
