import { createClient } from "@/lib/supabase/server";

export async function getActivePlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return [];
  return data;
}

export async function getMyCurrentSubscription(): Promise<any> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_plans ( * )")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data as any;
  } catch {
    return null;
  }
}

export async function getMyInvoices() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("issued_at", { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

export async function getInvoiceById(id: string) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data } = await supabase.from("invoices").select("*").eq("id", id).eq("user_id", auth.user.id).single();
    return data;
  } catch {
    return null;
  }
}

export async function getMyPendingTransaction(planId: string) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("plan_id", planId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data;
  } catch {
    return null;
  }
}

export async function getTransactionById(id: string) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data } = await supabase.from("payment_transactions").select("*").eq("id", id).eq("user_id", auth.user.id).single();
    return data;
  } catch {
    return null;
  }
          }
