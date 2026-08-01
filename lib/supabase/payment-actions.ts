"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { requestMomoPayment, getMomoTransactionStatus } from "@/lib/payments/mtn";
import { initiateOrangeMoneyPayment, getOrangeMoneyStatus } from "@/lib/payments/orange";
import { initiateCardPayment, getCardPaymentStatus } from "@/lib/payments/cinetpay";
import { finalizeSuccessfulPayment, markPaymentFailed } from "@/lib/payments/finalize";
import { normalizeCameroonPhone } from "@/lib/payments/types";

export interface CheckoutResult {
  error?: string;
  transactionId?: string;
  redirectUrl?: string; // present for Orange & Card (hosted checkout)
  awaitingApproval?: boolean; // true for MTN (USSD prompt sent, poll for result)
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function createPendingTransaction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  planId: string,
  provider: "mtn_momo" | "orange_money" | "cinetpay_card",
  amountXaf: number,
  phoneNumber?: string
) {
  const { data, error } = await supabase
    .from("payment_transactions")
    .insert({ user_id: userId, plan_id: planId, provider, amount_xaf: amountXaf, status: "pending", phone_number: phoneNumber } as any)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function startFreeTrialAction(planId: string): Promise<CheckoutResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour démarrer votre essai gratuit." };

  const { data, error } = await supabase.rpc("start_free_trial", { target_plan_id: planId });
  if (error) return { error: error.message.includes("essai gratuit") ? error.message : "Impossible de démarrer l'essai gratuit : " + error.message };

  revalidatePath("/pricing");
  revalidatePath("/settings");
  return { transactionId: (data as any)?.id };
}

export async function initiateMomoCheckoutAction(planId: string, phoneNumberRaw: string): Promise<CheckoutResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour vous abonner." };

  const { allowed } = checkRateLimit(`checkout:${user.id}`, 5, 5 * 60 * 1000);
  if (!allowed) return { error: "Trop de tentatives de paiement. Réessayez dans quelques minutes." };

  const phone = normalizeCameroonPhone(phoneNumberRaw).replace(/^237/, "");
  if (phone.length !== 9) return { error: "Numéro de téléphone invalide." };

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).single();
  if (!plan) return { error: "Plan introuvable." };

  const tx = await createPendingTransaction(supabase, user.id, planId, "mtn_momo", plan.price_xaf, phone);

  const result = await requestMomoPayment({
    amountXaf: plan.price_xaf,
    phoneNumberLocal: phone,
    externalId: tx.id,
    payerMessage: `Abonnement Prime Ciné - ${plan.name}`,
  });

  if (!result.success) {
    await markPaymentFailed(tx.id, result.error ?? "Échec inconnu");
    return { error: result.error };
  }

  await supabase.from("payment_transactions").update({ provider_reference: result.providerReference } as any).eq("id", tx.id);

  return { transactionId: tx.id, awaitingApproval: true };
}

export async function initiateOrangeCheckoutAction(planId: string): Promise<CheckoutResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour vous abonner." };

  const { allowed } = checkRateLimit(`checkout:${user.id}`, 5, 5 * 60 * 1000);
  if (!allowed) return { error: "Trop de tentatives de paiement. Réessayez dans quelques minutes." };

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).single();
  if (!plan) return { error: "Plan introuvable." };

  const tx = await createPendingTransaction(supabase, user.id, planId, "orange_money", plan.price_xaf);

  const result = await initiateOrangeMoneyPayment({
    amountXaf: plan.price_xaf,
    externalId: tx.id,
    orderLabel: `Abonnement Prime Ciné - ${plan.name}`,
  });

  if (!result.success) {
    await markPaymentFailed(tx.id, result.error ?? "Échec inconnu");
    return { error: result.error };
  }

  await supabase.from("payment_transactions").update({ provider_reference: result.providerReference } as any).eq("id", tx.id);

  return { transactionId: tx.id, redirectUrl: result.redirectUrl };
}

export async function initiateCardCheckoutAction(planId: string): Promise<CheckoutResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Connectez-vous pour vous abonner." };

  const { allowed } = checkRateLimit(`checkout:${user.id}`, 5, 5 * 60 * 1000);
  if (!allowed) return { error: "Trop de tentatives de paiement. Réessayez dans quelques minutes." };

  const { data: plan } = await supabase.from("subscription_plans").select("*").eq("id", planId).single();
  if (!plan) return { error: "Plan introuvable." };

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const tx = await createPendingTransaction(supabase, user.id, planId, "cinetpay_card", plan.price_xaf);

  const result = await initiateCardPayment({
    amountXaf: plan.price_xaf,
    externalId: tx.id,
    description: `Abonnement Prime Ciné - ${plan.name}`,
    customerName: profile?.full_name ?? "Client Prime Ciné",
    customerEmail: user.email ?? "client@primecine.cm",
  });

  if (!result.success) {
    await markPaymentFailed(tx.id, result.error ?? "Échec inconnu");
    return { error: result.error };
  }

  return { transactionId: tx.id, redirectUrl: result.redirectUrl };
}

/** Polled by the checkout UI while waiting for MTN's USSD approval (or as a
 * fallback for Orange/Card if the webhook is delayed). */
export async function pollTransactionStatusAction(transactionId: string): Promise<{ status: string; error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { status: "pending", error: "Non authentifié." };

  const { data: tx } = await supabase.from("payment_transactions").select("*").eq("id", transactionId).eq("user_id", user.id).single();
  if (!tx) return { status: "pending", error: "Transaction introuvable." };
  if (tx.status !== "pending") return { status: tx.status };

  let providerStatus: { status: string } = { status: "pending" };
  try {
    if (tx.provider === "mtn_momo" && tx.provider_reference) {
      providerStatus = await getMomoTransactionStatus(tx.provider_reference);
    } else if (tx.provider === "orange_money" && tx.provider_reference) {
      providerStatus = await getOrangeMoneyStatus(tx.id, tx.provider_reference);
    } else if (tx.provider === "cinetpay_card") {
      providerStatus = await getCardPaymentStatus(tx.id);
    }
  } catch {
    return { status: "pending" };
  }

  if (providerStatus.status === "successful") {
    await finalizeSuccessfulPayment(tx.id);
    revalidatePath("/settings");
    return { status: "successful" };
  }
  if (providerStatus.status === "failed" || providerStatus.status === "cancelled") {
    await markPaymentFailed(tx.id, "Paiement refusé ou annulé par l'utilisateur.");
    return { status: "failed" };
  }

  return { status: "pending" };
}

export async function cancelMySubscriptionAction(subscriptionId: string): Promise<{ error?: string; success?: boolean }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.rpc("cancel_my_subscription", { target_subscription_id: subscriptionId });
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function resumeMySubscriptionAction(subscriptionId: string): Promise<{ error?: string; success?: boolean }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.rpc("resume_my_subscription", { target_subscription_id: subscriptionId });
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
