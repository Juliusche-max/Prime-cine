"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export interface AuthResult {
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allow redirecting to a same-site relative path — never an absolute
 * URL — to prevent the `next` param from being used as an open redirect. */
function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

async function getClientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 100);
  const username = String(formData.get("username") ?? "").trim().slice(0, 40).replace(/[^a-zA-Z0-9_.-]/g, "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Merci de remplir tous les champs obligatoires." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Adresse email invalide." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const key = `signup:${await getClientKey()}`;
  const { allowed } = checkRateLimit(key, 5, 10 * 60 * 1000);
  if (!allowed) return { error: "Trop de tentatives. Merci de réessayer dans quelques minutes." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, username: username || undefined },
    },
  });

  if (error) return { error: error.message };

  redirect("/login?registered=1");
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !password) {
    return { error: "Merci de renseigner votre email et votre mot de passe." };
  }

  const key = `signin:${await getClientKey()}:${email}`;
  const { allowed, retryAfterMs } = checkRateLimit(key, 8, 5 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    return { error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Email ou mot de passe incorrect." };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
