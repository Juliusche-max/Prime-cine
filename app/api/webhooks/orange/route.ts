import { NextRequest, NextResponse } from "next/server";
import { getOrangeMoneyStatus } from "@/lib/payments/orange";
import { finalizeSuccessfulPayment, markPaymentFailed } from "@/lib/payments/finalize";
import { createAdminClient } from "@/lib/supabase/admin-client";

/**
 * Orange notifies via POST (form-encoded or JSON depending on integration
 * type) with the order_id we set at initiation (= our transaction id) and
 * a pay_token. We re-verify with Orange's transactionstatus endpoint
 * rather than trusting the notification body's status directly.
 */
export async function POST(req: NextRequest) {
  let orderId: string | undefined;
  let payToken: string | undefined;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    orderId = body.order_id;
    payToken = body.pay_token;
  } else {
    const form = await req.formData();
    orderId = form.get("order_id")?.toString();
    payToken = form.get("pay_token")?.toString();
  }

  if (!orderId) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data: tx } = await supabase.from("payment_transactions").select("*").eq("id", orderId).single();
    if (!tx) return NextResponse.json({ error: "Unknown transaction" }, { status: 404 });

    const reference = payToken ?? tx.provider_reference;
    if (!reference) return NextResponse.json({ error: "Missing pay_token" }, { status: 400 });

    const status = await getOrangeMoneyStatus(tx.id, reference);

    if (status.status === "successful") {
      await finalizeSuccessfulPayment(tx.id, status.raw);
    } else if (status.status === "failed" || status.status === "cancelled") {
      await markPaymentFailed(tx.id, "Orange Money: paiement échoué ou annulé.");
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
