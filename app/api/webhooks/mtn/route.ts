import { NextRequest, NextResponse } from "next/server";
import { getMomoTransactionStatus } from "@/lib/payments/mtn";
import { finalizeSuccessfulPayment, markPaymentFailed } from "@/lib/payments/finalize";

/**
 * MTN sends the externalId we set at request time (our internal
 * payment_transactions.id) plus its own referenceId/status. We don't trust
 * the payload's status field alone — we re-query MTN directly using the
 * reference we stored, so a forged POST to this URL can't fake a payment.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const externalId: string | undefined = body?.externalId;
  if (!externalId) return NextResponse.json({ error: "Missing externalId" }, { status: 400 });

  try {
    // We stored MTN's own referenceId in payment_transactions.provider_reference
    // at initiation time; re-check status against MTN directly using it.
    const { createAdminClient } = await import("@/lib/supabase/admin-client");
    const supabase = createAdminClient();
    const { data: tx } = await supabase.from("payment_transactions").select("*").eq("id", externalId).single();
    if (!tx || !tx.provider_reference) return NextResponse.json({ error: "Unknown transaction" }, { status: 404 });

    const status = await getMomoTransactionStatus(tx.provider_reference);

    if (status.status === "successful") {
      await finalizeSuccessfulPayment(tx.id, body);
    } else if (status.status === "failed") {
      await markPaymentFailed(tx.id, "MTN MoMo: paiement échoué.");
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
