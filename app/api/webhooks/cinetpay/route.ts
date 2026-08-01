@@ -1,42 +1,2 @@
import { NextRequest, NextResponse } from "next/server";
import { getCardPaymentStatus } from "@/lib/payments/cinetpay";
import { finalizeSuccessfulPayment, markPaymentFailed } from "@/lib/payments/finalize";
import { createAdminClient } from "@/lib/supabase/admin-client";

/**
 * CinetPay's own docs recommend NOT trusting the notification payload and
 * instead calling their `check` endpoint with the transaction_id to get
 * the authoritative status — which is what we do here.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let transactionId: string | undefined;

  if (contentType.includes("application/json")) {
    const body = await req.json();
    transactionId = body.cpm_trans_id ?? body.transaction_id;
  } else {
    const form = await req.formData();
    transactionId = form.get("cpm_trans_id")?.toString() ?? form.get("transaction_id")?.toString();
  }

  if (!transactionId) return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data: tx } = await supabase.from("payment_transactions").select("*").eq("id", transactionId).single();
    if (!tx) return NextResponse.json({ error: "Unknown transaction" }, { status: 404 });

    const status = await getCardPaymentStatus(tx.id);

    if (status.status === "successful") {
      await finalizeSuccessfulPayment(tx.id, status.raw);
    } else if (status.status === "failed" || status.status === "cancelled") {
      await markPaymentFailed(tx.id, "CinetPay: paiement refusé ou annulé.");
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
const { data: tx } = await supabase.from("payment_transactions").select("*")...
const status = await getCardPaymentStatus(tx.id);  // ← Property 'id' does not exist
