import { createAdminClient } from "@/lib/supabase/admin-client";

/**
 * Called by a webhook handler once a provider confirms a payment succeeded.
 * Runs with the service-role client (bypasses RLS) because this is the one
 * place in the app allowed to mark a transaction "successful" and grant an
 * active subscription.
 */
export async function finalizeSuccessfulPayment(transactionId: string, providerRawResponse?: unknown) {
  const supabase = createAdminClient();

  const { data: tx, error: txError } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (txError || !tx) return { error: "Transaction introuvable." };
  if (tx.status === "successful") return { success: true, alreadyProcessed: true };

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", tx.plan_id).single();
  if (!plan) return { error: "Plan introuvable." };

  const periodDays = plan.billing_period === "yearly" ? 365 : 30;
  const periodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: subscription, error: subError } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: tx.user_id,
      plan_id: tx.plan_id,
      status: "active",
      payment_method: tx.provider,
      current_period_end: periodEnd,
    } as any)
    .select()
    .single();

  if (subError) return { error: "Impossible d'activer l'abonnement : " + subError.message };

  await supabase
    .from("payment_transactions")
    .update({
      status: "successful",
      subscription_id: subscription.id,
      provider_raw_response: providerRawResponse as any,
    } as any)
    .eq("id", transactionId);

  await supabase.from("profiles").update({ subscription_tier: plan.tier } as any).eq("id", tx.user_id);

  const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number");

  await supabase.from("invoices").insert({
    user_id: tx.user_id,
    subscription_id: subscription.id,
    transaction_id: tx.id,
    invoice_number: invoiceNumber ?? `PC-${Date.now()}`,
    amount_xaf: tx.amount_xaf,
    status: "paid",
    plan_name: plan.name,
  } as any);

  return { success: true };
}

export async function markPaymentFailed(transactionId: string, reason: string) {
  const supabase = createAdminClient();
  await supabase
    .from("payment_transactions")
    .update({ status: "failed", failure_reason: reason } as any)
    .eq("id", transactionId);
}
